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

type Content = { content: string; color: string; type: 'content' | 'markup' };

function App() {
  const [contents, setContents] = useState<Content[]>([
    {
      content: lorem,
      color: '#fff',
      type: 'content',
    },
  ]);
  const [relatedContents, setRelatedContents] = useState<
    typeof contents | null
  >(null);
  const [markupStart, setMarkupStart] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [dealWithConflict, setDealWithConflict] = useState<
    'merge' | 'keepNew' | null
  >(null);
  const [showTools, setShowTools] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const reset = useCallback(() => {
    setRelatedContents(null);
    setMarkupStart(null);
    setHasConflict(false);
    setDealWithConflict(null);
    setShowTools(false);
    setConfirm(false);
    setMousePosition(null);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const selection = window.getSelection();
      console.log({ e, selection });
      if (markupStart === null) {
        return;
      }
      if (selection?.toString()) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        const index = Number(e.currentTarget.dataset.contentIndex);
        const currentRelatedContents = contents.slice(markupStart, index + 1);
        console.log({ markupStart, index, contents });
        setRelatedContents(currentRelatedContents);
        console.log({ currentRelatedContents });
        const hasConflict = currentRelatedContents.some(
          (item) => item.type === 'markup'
        );
        if (hasConflict) {
          setHasConflict(true);
        }
        setShowTools(true);
      } else {
        reset();
      }
    },
    [contents, markupStart, reset]
  );

  const handleConflict = useCallback((method: typeof dealWithConflict) => {
    setDealWithConflict(method);
  }, []);

  const finishMarkup = useCallback(() => {
    if (!relatedContents) {
      return;
    }
    const selection = getSelection();
    if (!selection) {
      return;
    }
    setContents((prev) => {
      let newContents = [...prev];
      if (hasConflict) {
      } else {
        const currentContent = relatedContents[0];
        console.log({
          currentContent,
          relatedContents,
          newContents,
        });
        const newMarkup: Content = {
          content: selection.toString(),
          color: 'yellow',
          type: 'markup',
        };
        const beforeMarkupContent: Content = {
          type: 'content',
          content: currentContent?.content.slice(0, selection.anchorOffset),
          color: '#fff',
        };
        const afterMarkupContent: Content = {
          content: currentContent?.content.slice(selection.focusOffset),
          color: '#fff',
          type: 'content',
        };
        console.log({
          beforeMarkupContent,
          newMarkup,
          afterMarkupContent,
        });
        newContents.splice(
          markupStart || 0,
          relatedContents.length,
          beforeMarkupContent,
          newMarkup,
          afterMarkupContent
        );
      }
      return newContents;
    });
    reset();
  }, [hasConflict, markupStart, relatedContents, reset]);

  console.log({ contents });

  useEffect(() => {
    if (!relatedContents) {
      return;
    }
    if (hasConflict && !dealWithConflict) {
      return;
    }
    if (confirm) {
      finishMarkup();
    }
  }, [confirm, dealWithConflict, finishMarkup, hasConflict, relatedContents]);

  return (
    <Main>
      <Article>
        {contents.map((item, index) => (
          <span
            key={index}
            style={{ background: item.color }}
            onMouseDown={() => setMarkupStart(index)}
            onMouseUp={(e) => handleMouseUp(e)}
            data-content-index={index}
          >
            {item.content}
          </span>
        ))}
      </Article>
      {showTools && (
        <Tools top={mousePosition?.y || 0} left={mousePosition?.x || 0}>
          {hasConflict && (
            <>
              <ToolButton onClick={() => handleConflict('merge')}>
                Merge
              </ToolButton>
              <ToolButton onClick={() => handleConflict('keepNew')}>
                Keep New
              </ToolButton>
              <ToolButton onClick={reset}>Cancel</ToolButton>
            </>
          )}
          {!hasConflict && (
            <ToolButton onClick={() => setConfirm(true)}>confirm</ToolButton>
          )}
        </Tools>
      )}
    </Main>
  );
}

export default App;
