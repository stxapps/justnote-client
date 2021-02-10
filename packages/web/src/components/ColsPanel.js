import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import { throttle } from '../utils';

import { useSafeAreaFrame } from '.';
import NoteEditor from './NoteEditor';

const unFocus = (document, window) => {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
    } catch (e) { }
  }
};

const ColsPanel = React.memo(() => {

  const resizerWidth = 9;

  const pane1MinWidth = 160;
  const pane1MaxWidth = 384;
  const pane2MinWidth = 180;
  const pane2MaxWidth = 480;

  const { width: safeAreaWidth } = useSafeAreaFrame();

  const storageKey = 'colsPanelState';
  const storedState = useMemo(() => localStorage.getItem(storageKey), []);
  const initialState = {
    isPane1Shown: true,
    isPane3FullScreen: false,
    pane1Width: safeAreaWidth * 0.25,
    pane2Width: safeAreaWidth * 0.25,
  };
  if (storedState) {
    const s = JSON.parse(storedState);
    initialState.isPane1Shown = s.isPane1Shown;
    initialState.pane1Width = s.pane1Width;
    initialState.pane2Width = s.pane2Width;
  }
  const [state, setState] = useState(initialState);

  const [isResizeActive, setIsResizeActive] = useState(false);
  const startInfo = useRef(null);
  const whichResizer = useRef(null);

  const _onLeftResizerTouchStart = (event) => {
    unFocus(document, window);

    setIsResizeActive(true);
    startInfo.current = {
      mouseX: event.touches[0].clientX,
      pane1Width: state.pane1Width,
      pane2Width: state.pane2Width,
    };
    whichResizer.current = 'l';
  };

  const onLeftResizerTouchStart = (event) => {
    event.preventDefault();
    _onLeftResizerTouchStart(event);
  };

  const onLeftResizerMouseDown = (event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    _onLeftResizerTouchStart(eventWithTouches);
  };

  const _onRightResizerTouchStart = (event) => {
    unFocus(document, window);

    setIsResizeActive(true);
    startInfo.current = {
      mouseX: event.touches[0].clientX,
      pane1Width: state.pane1Width,
      pane2Width: state.pane2Width,
    };
    whichResizer.current = 'r';
  };

  const onRightResizerTouchStart = (event) => {
    event.preventDefault();
    _onRightResizerTouchStart(event);
  };

  const onRightResizerMouseDown = (event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    _onRightResizerTouchStart(eventWithTouches);
  };

  const onTouchMove = useCallback((event) => {
    if (isResizeActive) {
      unFocus(document, window);

      const mouseX = event.touches[0].clientX;
      const delta = mouseX - startInfo.current.mouseX;

      if (whichResizer.current === 'l') {
        const _width = Math.max(
          Math.min(startInfo.current.pane1Width + delta, pane1MaxWidth), pane1MinWidth
        );
        if (_width !== state.pane1Width) {
          setState(prevState => ({ ...prevState, pane1Width: _width }));
        }
      } else if (whichResizer.current === 'r') {
        const _width = Math.max(
          Math.min(startInfo.current.pane2Width + delta, pane2MaxWidth), pane2MinWidth
        );
        if (_width !== state.pane2Width) {
          setState(prevState => ({ ...prevState, pane2Width: _width }));
        }
      } else throw new Error(`Invalid whichResizer: ${whichResizer.current}`);
    }
  }, [isResizeActive, state.pane1Width, state.pane2Width]);

  const onMouseMove = useCallback((event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    onTouchMove(eventWithTouches);
  }, [onTouchMove]);

  const onTouchEnd = (event) => {
    event.preventDefault();
    onMouseUp();
  };

  const onMouseUp = useCallback(() => {
    if (isResizeActive) {
      setIsResizeActive(false);
      startInfo.current = null;
      whichResizer.current = null;
    }
  }, [isResizeActive]);

  const onTogglePane1Shown = useCallback(() => {
    setState(prevState => ({ ...prevState, isPane1Shown: !state.isPane1Shown }));
  }, [state.isPane1Shown]);

  const onTogglePane3FullScreen = useCallback(() => {
    setState(prevState => {
      return { ...prevState, isPane3FullScreen: !state.isPane3FullScreen };
    });
  }, [state.isPane3FullScreen]);

  useEffect(() => {

    const _onMouseMove = throttle(onMouseMove, 16);
    const _onTouchMove = throttle(onTouchMove, 16);

    document.addEventListener('mousemove', _onMouseMove);
    document.addEventListener('touchmove', _onTouchMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', _onMouseMove);
      document.removeEventListener('touchmove', _onTouchMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onTouchMove, onMouseUp]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const pane1Classes = state.isPane1Shown && !state.isPane3FullScreen ? '' : 'hidden';
  const resizer1Classes = state.isPane1Shown && !state.isPane3FullScreen ? '' : 'hidden';
  const pane2Classes = !state.isPane3FullScreen ? '' : 'hidden';
  const resizer2Classes = !state.isPane3FullScreen ? '' : 'hidden';

  return (
    <div className="w-full h-full h-screen flex">
      <motion.div style={{ width: state.pane1Width }} className={`overflow-hidden ${pane1Classes}`} layout={!isResizeActive}>
        <div style={{ minWidth: '30rem' }} className="bg-green-400 w-full">Sidebar</div>
      </motion.div>
      <motion.div onMouseDown={onLeftResizerMouseDown} onTouchStart={onLeftResizerTouchStart} onTouchEnd={onTouchEnd} style={{ width: resizerWidth }} className={`relative bg-black opacity-20 bg-clip-padding cursor-resize transition-opacity border-l-4 border-r-4 border-white hover:border-black hover:border-opacity-50 overflow-visible ${resizer1Classes}`} layout={!isResizeActive}>
        <button onClick={onTogglePane1Shown} className="absolute right-0 bottom-8 w-4 h-4 bg-green-400"></button>
      </motion.div>
      <motion.div style={{ width: state.pane2Width }} className={`relative overflow-hidden ${pane2Classes}`} layout={!isResizeActive}>
        <div style={{ minWidth: '30rem' }} className="bg-yellow-400 w-full">Note List</div>
        <AnimatePresence>
          {!state.isPane1Shown && <motion.button onClick={onTogglePane1Shown} className="absolute left-0 bottom-8 w-4 h-4 bg-green-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}></motion.button>}
        </AnimatePresence>
      </motion.div>
      <motion.div onMouseDown={onRightResizerMouseDown} onTouchStart={onRightResizerTouchStart} onTouchEnd={onTouchEnd} style={{ width: resizerWidth }} className={`relative bg-black opacity-20 bg-clip-padding cursor-resize transition-opacity border-l-4 border-r-4 border-white overflow-visible hover:border-black hover:border-opacity-50 ${resizer2Classes}`} layout={!isResizeActive}></motion.div >
      <motion.div className="flex-1 overflow-hidden" layout={!isResizeActive}>
        <NoteEditor isFullScreen={state.isPane3FullScreen} onToggleFullScreen={onTogglePane3FullScreen} />
      </motion.div>
    </div >
  );
});

export default ColsPanel;
