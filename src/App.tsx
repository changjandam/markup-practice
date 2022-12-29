import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import type MarkupItem from './types/markupItem';
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
  max-width: 600px;
  max-height: 600px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  font-size: 1.2rem;
  overflow-y: auto;
`;

const MarkupButton = styled.button<{ top: number; left: number }>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
`;

const initPosition = {
  top: 0,
  left: 0,
  show: false,
};

function App() {
  const [content, setContent] = useState<React.ReactNode[]>([]);
  const [markups, setMarkups] = useState<MarkupItem[]>([]);
  const [showLorem, setShowLorem] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    left: number;
    show: boolean;
  }>(initPosition);
  const [showSelection, setShowSelection] = useState(false);

  useEffect(() => {
    setContent([lorem]);
  }, []);

  const handleMouseUp = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const selection = window.getSelection();
    if (selection?.type === 'Range') {
      setButtonPosition({
        top: e.clientY + 10,
        left: e.clientX,
        show: true,
      });
    } else {
      setButtonPosition(initPosition);
      setShowLorem(false);
    }
  };

  const handleMark = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      const position = [selection.anchorOffset, selection.focusOffset].sort(
        (a, b) => a - b
      ) as [number, number];
      setMarkups((prev) =>
        [
          ...prev,
          {
            text: selection.toString(),
            position,
            comment: '',
            color: 'black',
            backgroundColor: 'yellow',
          },
        ].sort((a, b) => b.position[0] - a.position[0])
      );
      setButtonPosition(initPosition);
      setShowLorem(false);
    }
  }, []);

  useEffect(() => {
    console.log({ markups });
    setContent(() => {
      let newContent: React.ReactNode[] = [lorem];
      markups.forEach((markup) => {
        const lastContent = newContent?.shift();
        if (typeof lastContent === 'string') {
          const [start, end] = markup.position;
          const { text, color, backgroundColor } = markup;
          const before = lastContent.slice(0, start);
          const after = lastContent.slice(end);
          const marked = <span style={{ color, backgroundColor }}>{text}</span>;
          newContent = [before, marked, after, ...newContent];
        }
      });
      return newContent;
    });
  }, [markups]);

  console.log({ content });

  return (
    <Main
      onClick={() =>
        getSelection()?.type !== 'Range' && setButtonPosition(initPosition)
      }
    >
      <Article onMouseDown={() => setShowLorem(true)} onMouseUp={handleMouseUp}>
        {showLorem ? lorem : content}
      </Article>
      {buttonPosition.show && (
        <MarkupButton
          top={buttonPosition.top}
          left={buttonPosition.left}
          onClick={handleMark}
        >
          Mark
        </MarkupButton>
      )}
      {showSelection && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <button>prev</button>
            <button>new</button>
            <button>combine</button>
          </div>
        </div>
      )}
    </Main>
  );
}

export default App;
