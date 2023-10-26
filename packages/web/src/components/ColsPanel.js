import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import lsgApi from '../apis/localSg';
import { COLS_PANEL_STATE, NEW_NOTE, NEW_NOTE_OBJ } from '../types/const';
import { makeGetUnsavedNote } from '../selectors';
import { throttle, isMobile as _isMobile } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const unFocus = (document, window) => {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
    } catch (error) { }
  }
};

const ColsPanel = () => {

  const pane1DefaultWidth = 256;

  const pane1MinWidth = 160;
  const pane1MaxWidth = pane1DefaultWidth * 2;
  const pane2MinWidth = 180;
  const pane2MaxWidth = 480;

  const {
    width: safeAreaWidth, height: safeAreaHeight, windowHeight,
  } = useSafeAreaFrame();
  const getUnsavedNote = useMemo(makeGetUnsavedNote, []);
  const note = useSelector(state => {
    const { listName, noteId } = state.display;

    if (!noteId) return null;
    if (noteId === NEW_NOTE) return NEW_NOTE_OBJ;
    if (noteId.startsWith('conflict')) return state.conflictedNotes[noteId];
    return state.notes[listName][noteId];
  });
  const unsavedNote = useSelector(state => getUnsavedNote(state, note));

  const storageKey = COLS_PANEL_STATE;
  const storedState = useMemo(() => lsgApi.getItemSync(storageKey), [storageKey]);
  const initialState = {
    isPane1Shown: true,
    isPane3FullScreen: false,
    pane1Width: pane1DefaultWidth,
    pane2Width: safeAreaWidth * 0.25,
  };
  if (storedState) {
    const s = JSON.parse(storedState);
    initialState.isPane1Shown = s.isPane1Shown;
    initialState.pane1Width = s.pane1Width;
    initialState.pane2Width = s.pane2Width;
  }
  const [state, setState] = useState({ ...initialState });

  const [isResizeActive, setIsResizeActive] = useState(false);
  const startInfo = useRef(null);
  const whichResizer = useRef(null);

  const tailwind = useTailwind();

  const isMobile = useMemo(() => _isMobile(), []);
  const preventScrollClassNames = useMemo(() => {
    // When overscroll-none is fixed, no need the empty space to have the scroll.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=813094
    // https://github.com/whatwg/html/issues/7732
    if (isMobile && safeAreaHeight < windowHeight) {
      return 'overflow-y-scroll overscroll-contain hide-scrollbar';
    }
    return '';
  }, [safeAreaHeight, windowHeight, isMobile]);

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
    if (isResizeActive && startInfo.current) {
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
  }, [isResizeActive, state.pane1Width, state.pane2Width, pane1MaxWidth]);

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
    lsgApi.setItemSync(storageKey, JSON.stringify(state));
  }, [storageKey, state]);

  const pane1Classes = state.isPane1Shown && !state.isPane3FullScreen ? '' : 'hidden';
  const resizer1Classes = state.isPane1Shown && !state.isPane3FullScreen ? '' : 'hidden';
  const pane2Classes = !state.isPane3FullScreen ? '' : 'hidden';
  const resizer2Classes = !state.isPane3FullScreen ? '' : 'hidden';

  const panel = (
    <div style={{ height: safeAreaHeight }} className={tailwind('flex w-full overflow-hidden bg-white blk:bg-gray-900')}>
      <div style={{ width: state.pane1Width }} className={tailwind(`overflow-hidden bg-white blk:bg-gray-900 ${pane1Classes}`)}>
        <Sidebar />
      </div>
      <div className={tailwind(`relative w-2 overflow-visible bg-gray-100 blk:bg-gray-800 ${resizer1Classes}`)}>
        <div onMouseDown={onLeftResizerMouseDown} onTouchStart={onLeftResizerTouchStart} onTouchEnd={onTouchEnd} className={tailwind('h-full w-full cursor-resize bg-transparent')} />
        <button onClick={onTogglePane1Shown} className={tailwind('group absolute right-0 bottom-8 h-7 w-5 rounded-tl rounded-bl bg-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 blk:bg-gray-700 blk:focus:ring-gray-600')}>
          <svg className={tailwind('h-5 w-5 text-gray-400 group-hover:text-gray-500 blk:text-gray-500 blk:group-hover:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.707 15.707C15.5195 15.8945 15.2652 15.9998 15 15.9998C14.7349 15.9998 14.4806 15.8945 14.293 15.707L9.29303 10.707C9.10556 10.5195 9.00024 10.2652 9.00024 10C9.00024 9.73486 9.10556 9.48055 9.29303 9.29302L14.293 4.29302C14.3853 4.19751 14.4956 4.12133 14.6176 4.06892C14.7396 4.01651 14.8709 3.98892 15.0036 3.98777C15.1364 3.98662 15.2681 4.01192 15.391 4.0622C15.5139 4.11248 15.6255 4.18673 15.7194 4.28062C15.8133 4.37452 15.8876 4.48617 15.9379 4.60907C15.9881 4.73196 16.0134 4.86364 16.0123 4.99642C16.0111 5.1292 15.9835 5.26042 15.9311 5.38242C15.8787 5.50443 15.8025 5.61477 15.707 5.70702L11.414 10L15.707 14.293C15.8945 14.4805 15.9998 14.7349 15.9998 15C15.9998 15.2652 15.8945 15.5195 15.707 15.707ZM9.70703 15.707C9.5195 15.8945 9.26519 15.9998 9.00003 15.9998C8.73487 15.9998 8.48056 15.8945 8.29303 15.707L3.29303 10.707C3.10556 10.5195 3.00024 10.2652 3.00024 10C3.00024 9.73486 3.10556 9.48055 3.29303 9.29302L8.29303 4.29302C8.48163 4.11086 8.73423 4.01007 8.99643 4.01235C9.25863 4.01462 9.50944 4.11979 9.69485 4.3052C9.88026 4.49061 9.98543 4.74142 9.9877 5.00362C9.98998 5.26582 9.88919 5.51842 9.70703 5.70702L5.41403 10L9.70703 14.293C9.8945 14.4805 9.99982 14.7349 9.99982 15C9.99982 15.2652 9.8945 15.5195 9.70703 15.707Z" />
          </svg>
        </button>
      </div>
      <div style={{ width: state.pane2Width }} className={tailwind(`relative overflow-hidden bg-white blk:bg-gray-900 ${pane2Classes}`)}>
        <NoteList />
        {!state.isPane1Shown && <button onClick={onTogglePane1Shown} className={tailwind('group absolute left-0 bottom-8 h-7 w-5 rounded-tr rounded-br bg-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 blk:bg-gray-600 blk:focus:ring-gray-500')}>
          <svg className={tailwind('h-5 w-5 text-gray-400 group-hover:text-gray-500 blk:text-gray-500 blk:group-hover:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10.2931 15.707C10.1056 15.5195 10.0003 15.2652 10.0003 15C10.0003 14.7349 10.1056 14.4805 10.2931 14.293L14.5861 10L10.2931 5.70702C10.1976 5.61477 10.1214 5.50443 10.069 5.38242C10.0166 5.26042 9.98898 5.1292 9.98783 4.99642C9.98668 4.86364 10.012 4.73196 10.0623 4.60907C10.1125 4.48617 10.1868 4.37452 10.2807 4.28062C10.3746 4.18673 10.4862 4.11248 10.6091 4.0622C10.732 4.01192 10.8637 3.98662 10.9965 3.98777C11.1293 3.98892 11.2605 4.01651 11.3825 4.06892C11.5045 4.12133 11.6148 4.19751 11.7071 4.29302L16.7071 9.29302C16.8946 9.48055 16.9999 9.73486 16.9999 10C16.9999 10.2652 16.8946 10.5195 16.7071 10.707L11.7071 15.707C11.5196 15.8945 11.2652 15.9998 11.0001 15.9998C10.7349 15.9998 10.4806 15.8945 10.2931 15.707Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M4.29303 15.707C4.10556 15.5195 4.00024 15.2651 4.00024 15C4.00024 14.7348 4.10556 14.4805 4.29303 14.293L8.58603 9.99998L4.29303 5.70698C4.11087 5.51838 4.01008 5.26578 4.01236 5.00358C4.01463 4.74138 4.1198 4.49057 4.30521 4.30516C4.49062 4.11975 4.74143 4.01458 5.00363 4.01231C5.26583 4.01003 5.51843 4.11082 5.70703 4.29298L10.707 9.29298C10.8945 9.48051 10.9998 9.73482 10.9998 9.99998C10.9998 10.2651 10.8945 10.5195 10.707 10.707L5.70703 15.707C5.5195 15.8945 5.26519 15.9998 5.00003 15.9998C4.73487 15.9998 4.48056 15.8945 4.29303 15.707Z" />
          </svg>
        </button>}
      </div>
      <div onMouseDown={onRightResizerMouseDown} onTouchStart={onRightResizerTouchStart} onTouchEnd={onTouchEnd} className={tailwind(`relative cursor-resize overflow-visible border-l border-gray-100 bg-white pr-1 blk:border-gray-800 blk:bg-gray-900 ${resizer2Classes}`)} />
      <div className={tailwind('flex-1 overflow-hidden bg-white blk:bg-gray-900')}>
        <NoteEditor note={note} unsavedNote={unsavedNote} isFullScreen={state.isPane3FullScreen} onToggleFullScreen={onTogglePane3FullScreen} />
      </div>
    </div>
  );

  if (!isMobile) return panel;

  return (
    <div style={{ height: safeAreaHeight }} className={tailwind(`w-full ${preventScrollClassNames}`)}>
      {panel}
      {preventScrollClassNames.length > 0 && <div className={tailwind('h-px')} />}
    </div>
  );
};

export default React.memo(ColsPanel);
