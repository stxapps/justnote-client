import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

import { throttle } from '../utils';

import { useSafeAreaFrame, useStateWithLocalStorage } from '.';

const unFocus = (document, window) => {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
    } catch (e) { }
  }
};

const _Resizer = (props) => {

  const {
    onMouseDown,
    onTouchStart,
    onTouchEnd,
  } = props;

  const _onMouseDown = event => {
    onMouseDown(event);
  };

  const _onTouchStart = event => {
    event.preventDefault();
    onTouchStart(event);
  };

  const _onTouchEnd = event => {
    event.preventDefault();
    onTouchEnd(event);
  };

  return (
    <div style={{ width: '9px', }} className="relative bg-black opacity-20 bg-clip-padding cursor-resize transition-opacity border-l-4 border-r-4 border-white overflow-visible hover:border-black hover:border-opacity-50" onMouseDown={_onMouseDown} onTouchStart={_onTouchStart} onTouchEnd={_onTouchEnd}>
      <div className="absolute w-4 h-4 bg-green-400 left-0 bottom-8"></div>
    </div>
  );
};

_Resizer.propTypes = {
  onMouseDown: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func.isRequired,
  onTouchEnd: PropTypes.func.isRequired,
};

const Resizer = React.memo(_Resizer);

const ColsPanel = React.memo(() => {

  const pane1MinWidth = 160;
  const pane1MaxWidth = 384;
  const pane2MinWidth = 180;
  const pane2MaxWidth = 480;

  const { width: safeAreaWidth } = useSafeAreaFrame();

  const [pane1Width, setPane1Width] = useStateWithLocalStorage(
    safeAreaWidth * 0.25, 'colsPanelPane1Width'
  );
  const [pane2Width, setPane2Width] = useStateWithLocalStorage(
    safeAreaWidth * 0.25, 'colsPanelPane2Width'
  );

  const isResizeActive = useRef(false);
  const startInfo = useRef(null);
  const whichResizer = useRef(null);

  const onLeftResizerTouchStart = useCallback((event) => {
    unFocus(document, window);

    isResizeActive.current = true;
    startInfo.current = {
      mouseX: event.touches[0].clientX,
      pane1Width: pane1Width,
      pane2Width: pane2Width,
    };
    whichResizer.current = 'l';
  }, [pane1Width, pane2Width]);

  const onLeftResizerMouseDown = useCallback((event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    onLeftResizerTouchStart(eventWithTouches);
  }, [onLeftResizerTouchStart]);

  const onRightResizerTouchStart = useCallback((event) => {
    unFocus(document, window);

    isResizeActive.current = true;
    startInfo.current = {
      mouseX: event.touches[0].clientX,
      pane1Width: pane1Width,
      pane2Width: pane2Width,
    };
    whichResizer.current = 'r';
  }, [pane1Width, pane2Width]);

  const onRightResizerMouseDown = useCallback((event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    onRightResizerTouchStart(eventWithTouches);
  }, [onRightResizerTouchStart]);

  const onTouchMove = useCallback((event) => {
    if (isResizeActive.current) {
      unFocus(document, window);

      const mouseX = event.touches[0].clientX;
      const delta = mouseX - startInfo.current.mouseX;

      if (whichResizer.current === 'l') {
        const _width = Math.max(
          Math.min(startInfo.current.pane1Width + delta, pane1MaxWidth), pane1MinWidth
        );
        if (_width !== pane1Width) setPane1Width(_width);
      } else if (whichResizer.current === 'r') {
        const _width = Math.max(
          Math.min(startInfo.current.pane2Width + delta, pane2MaxWidth), pane2MinWidth
        );
        if (_width !== pane2Width) setPane2Width(_width);
      } else throw new Error(`Invalid whichResizer: ${whichResizer.current}`);
    }
  }, [pane1Width, setPane1Width, pane2Width, setPane2Width]);

  const onMouseMove = useCallback((event) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    onTouchMove(eventWithTouches);
  }, [onTouchMove]);

  const onMouseUp = useCallback(() => {
    if (isResizeActive.current) {
      isResizeActive.current = false;
      startInfo.current = null;
      whichResizer.current = null;
    }
  }, []);

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

  return (
    <div className="w-full h-full h-screen flex">
      <div style={{ width: pane1Width }} className="overflow-hidden">
        <div style={{ minWidth: '30rem' }} className="bg-green-400 w-full">Sidebar</div>
      </div>
      <Resizer onMouseDown={onLeftResizerMouseDown} onTouchStart={onLeftResizerTouchStart} onTouchEnd={onMouseUp} />
      <div style={{ width: pane2Width }} className="overflow-hidden">
        <div style={{ minWidth: '30rem' }} className="bg-yellow-400 w-full">Note List</div>
      </div>
      <Resizer onMouseDown={onRightResizerMouseDown} onTouchStart={onRightResizerTouchStart} onTouchEnd={onMouseUp} />
      <div className="flex-1 overflow-hidden">
        <div className="bg-red-300 w-full">Note Editor</div>
      </div>
    </div>
  );
});

export default ColsPanel;
