import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import MarkupItem from './types/markupItem';
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
  const [markup, setMarkup] = useState<React.ReactNode[]>([]);
  const [showLorem, setShowLorem] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    left: number;
    show: boolean;
  }>(initPosition);

  useEffect(() => {
    setMarkup([lorem]);
  }, []);

  const handleMouseUp = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const selection = window.getSelection();
    if (selection) {
      console.log({
        start: selection.anchorOffset,
        end: selection.focusOffset,
        text: selection.toString(),
        e,
        selection,
      });
    }
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

  const handleMark = () => {
    const text = lorem;
    const selection = window.getSelection();
    if (selection) {
      const start = selection.anchorOffset;
      const end = selection.focusOffset;
      const markedText = selection.toString();
      const before = text.slice(0, start);
      const after = text.slice(end);
      const marked = (
        <span style={{ backgroundColor: 'yellow' }}>{markedText}</span>
      );
      setMarkup([before, marked, after]);
      setButtonPosition(initPosition);
      setShowLorem(false);
    }
  };

  return (
    <Main
      onClick={() =>
        getSelection()?.type !== 'Range' && setButtonPosition(initPosition)
      }
    >
      <Article onMouseDown={() => setShowLorem(true)} onMouseUp={handleMouseUp}>
        {showLorem ? lorem : markup}
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
    </Main>
  );
}

export default App;
