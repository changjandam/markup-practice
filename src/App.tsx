import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import lorem from './loremText';

const Main = styled.main`
  width: 100vw;
  height: 100vh;
  background-color: #cfcfcf;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Article = styled.article`
  width: 600px;
  max-height: 600px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  font-size: 1.2rem;
  overflow-y: auto;
`;

const Tools = styled.div<{ top: number; left: number }>`
  position: absolute;
  top: ${(props: { top: number }) => props.top}px;
  left: ${(props: { left: number }) => props.left}px;
  padding: 1px;
  background-color: #000;
  display: flex;
  gap: 1px;
`;

const ToolButton = styled.button`
  border: none;
`;

type Content = { text: string; color: string; type: 'content' | 'markup' };

function App() {
  const [contents, setContents] = useState<Content[]>([
    {
      text: lorem || '1234567890',
      color: '#fff',
      type: 'content',
    },
  ]);
  const [showTools, setShowTools] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [confirm, setConfirm] = useState(false);

  const reset = useCallback(() => {
    setShowTools(false);
    setMousePosition(null);
    setConfirm(false);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const selection = getSelection();
      if (selection?.toString()) {
        setMousePosition({
          x: e.clientX,
          y: e.clientY,
        });
        setShowTools(true);
      } else {
        reset();
      }
    },
    [reset]
  );

  const handleConfirm = useCallback(() => {
    const selection = getSelection();
    setContents((prev) => {
      if (!selection?.toString()) {
        return prev;
      }
      let newContents = [...prev];
      let [startContentIndex, endContentIndex] = [
        selection?.anchorNode?.parentElement?.id.split('-')[1],
        selection?.focusNode?.parentElement?.id.split('-')[1],
      ].map((index) => Number(index));
      let startOffset = selection?.anchorOffset;
      let endOffset = selection?.focusOffset;

      if (startContentIndex > endContentIndex) {
        [startContentIndex, endContentIndex] = [
          endContentIndex,
          startContentIndex,
        ];
        [startOffset, endOffset] = [endOffset, startOffset];
      }
      if (startContentIndex === endContentIndex && startOffset > endOffset) {
        [startOffset, endOffset] = [endOffset, startOffset];
      }
      endOffset += newContents
        .slice(startContentIndex, endContentIndex)
        .map((content) => content.text)
        .join('').length;
      const relatedContents = newContents.slice(
        startContentIndex,
        endContentIndex + 1
      );
      const relatedText = relatedContents.reduce((acc, cur) => {
        return acc + cur.text;
      }, '');

      const before: Content = {
        text: relatedText.slice(0, startOffset),
        color: '#fff',
        type: 'content',
      };
      const after: Content = {
        text: relatedText.slice(endOffset),
        color: '#fff',
        type: 'content',
      };
      const selected: Content = {
        text: relatedText.slice(startOffset, endOffset),
        color: '#ff0',
        type: 'markup',
      };
      newContents.splice(
        startContentIndex,
        relatedContents.length,
        before,
        selected,
        after
      );
      const groupContents = newContents.reduce((acc, cur) => {
        const lastGroupType = acc.at(-1)?.[0]?.type;
        if (lastGroupType === cur.type) {
          acc.at(-1)?.push(cur);
        } else {
          acc.push([cur]);
        }
        return acc;
      }, [] as Content[][]);
      newContents = groupContents.map((group) =>
        group.reduce(
          (acc, cur) => {
            return {
              text: acc.text + cur.text,
              color: cur.color,
              type: cur.type,
            };
          },
          {
            text: '',
            color: '#fff',
            type: 'content',
          }
        )
      );
      return newContents;
    });
    reset();
  }, [reset]);

  useEffect(() => {
    if (confirm) {
      handleConfirm();
    }
  }, [confirm, handleConfirm]);

  useEffect(() => {
    getSelection()?.empty();
  }, [contents]);

  console.log({ contents });

  return (
    <Main onMouseUp={(e) => handleMouseUp(e)}>
      <Article>
        {contents.map((item, index) => (
          <span
            id={`content-${index}`}
            key={index}
            style={{ background: item.color }}
          >
            {item.text}
          </span>
        ))}
      </Article>
      {showTools && (
        <Tools top={mousePosition?.y || 0} left={mousePosition?.x || 0}>
          <ToolButton onClick={() => setConfirm(true)}>confirm</ToolButton>
        </Tools>
      )}
    </Main>
  );
}

export default App;
