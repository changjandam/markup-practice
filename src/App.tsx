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

const OptionMask = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Option = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  gap: 10px;
`;

function App() {
  const [contents, setContents] = useState<
    { content: string; color: string; type: 'content' | 'markup' }[]
  >([
    {
      content: lorem,
      color: '#000',
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
  const [hasConflict, setHasConflict] = useState(true);
  const [dealWithConflict, setDealWithConflict] = useState<
    'merge' | 'keepNew' | null
  >(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const reset = useCallback(() => {
    setRelatedContents(null);
    setMarkupStart(null);
    setHasConflict(false);
    setDealWithConflict(null);
    setShowConfirm(false);
    setConfirm(false);
    setMousePosition(null);
  }, []);

  const handleMarkup = useCallback(
    (index: number) => {
      if (markupStart === null) return;
      const currentRelatedContents = contents.slice(markupStart, index + 1);
      setRelatedContents(currentRelatedContents);
      const hasConflict = currentRelatedContents.some(
        (item) => item.type === 'markup'
      );
      if (hasConflict) {
        setHasConflict(true);
      } else {
        setShowConfirm(true);
      }
    },
    [contents, markupStart]
  );

  const handleConflict = useCallback((method: typeof dealWithConflict) => {
    setDealWithConflict(method);
    setShowConfirm(true);
  }, []);

  const finishMarkup = useCallback(() => {}, []);

  useEffect(() => {
    if (!relatedContents) {
      return;
    }
    if (hasConflict) {
      return;
    }
    if (!dealWithConflict) {
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
            style={{ color: item.color }}
            onMouseDown={() => setMarkupStart(index)}
            onMouseUp={() => handleMarkup(index)}
          >
            {item.content}
          </span>
        ))}
      </Article>
      {hasConflict && (
        <OptionMask>
          <Option>
            <button onClick={() => handleConflict('merge')}>合併</button>
            <button onClick={() => handleConflict('keepNew')}>保留最新</button>
            <button onClick={reset}>取消</button>
          </Option>
        </OptionMask>
      )}
    </Main>
  );
}

export default App;
