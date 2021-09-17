import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler, PanResponder,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updateNoteId, updatePopup } from '../actions';
import { NEW_NOTE, NEW_NOTE_OBJ, SIDEBAR_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { sidebarFMV } from '../types/animConfigs';

import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const NavPanel = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const note = useSelector(state => {
    const { listName, noteId } = state.display;

    if (!noteId) return null;
    if (noteId === NEW_NOTE) return NEW_NOTE_OBJ;
    if (noteId.startsWith('conflict')) return state.conflictedNotes[listName][noteId];
    return state.notes[listName][noteId];
  });
  const [derivedNote, setDerivedNote] = useState(note);

  const isSidebarShown = useSelector(state => state.display.isSidebarPopupShown);
  const [didSidebarAnimEnd, setDidSidebarAnimEnd] = useState(true);
  const [derivedIsSidebarShown, setDerivedIsSidebarShown] = useState(isSidebarShown);
  const sidebarAnim = useRef(new Animated.Value(1)).current;
  const sidebarBackHandler = useRef(null);

  const rightPanelAnim = useRef(new Animated.Value(1)).current;
  const rightPanelBackHandler = useRef(null);

  const isEditorFocused = useSelector(state => state.display.isEditorFocused);
  const didSwipeToOpenSidebar = useRef(false);
  const dispatch = useDispatch();

  const shouldSetPanResponder = useCallback((_, gestureState) => {
    if (gestureState.numberActiveTouches > 1) return false;

    const maxX = (safeAreaWidth + insets.left + insets.right) * 0.25;
    const isSwipingX = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

    didSwipeToOpenSidebar.current = false;
    if (!isSidebarShown && derivedNote === null) {
      if (gestureState.moveX > maxX) return false;
      if (isSwipingX && gestureState.dx > 5) {
        didSwipeToOpenSidebar.current = true;
        dispatch(updatePopup(SIDEBAR_POPUP, true));
        return true;
      }
      return false;
    } else if (isSidebarShown) {
      return isSwipingX && gestureState.dx < -1;
    } else if (derivedNote !== null && !isEditorFocused) {
      if (gestureState.moveX > maxX) return false;
      return isSwipingX && gestureState.dx > 5;
    }

    return false;
  }, [isSidebarShown, derivedNote, isEditorFocused, safeAreaWidth, insets, dispatch]);

  const onPanResponderMove = useCallback((_, gestureState) => {
    const width = safeAreaWidth + insets.left + insets.right;

    if (isSidebarShown && !didSwipeToOpenSidebar.current) {
      const moveRatio = Math.abs(Math.min(0, gestureState.dx) / width);
      sidebarAnim.setValue(moveRatio);
    } else if (derivedNote !== null && !isEditorFocused) {
      const moveRatio = Math.max(0, gestureState.dx) / width;
      rightPanelAnim.setValue(moveRatio);
    }
  }, [
    isSidebarShown, derivedNote, isEditorFocused, safeAreaWidth, insets,
    sidebarAnim, rightPanelAnim,
  ]);

  const onPanResponderRelease = useCallback((_, gestureState) => {
    if (isSidebarShown && !didSwipeToOpenSidebar.current) {
      if (gestureState.dx > -40) {
        Animated.timing(
          sidebarAnim, { toValue: 0, ...sidebarFMV.visible, duration: 200 }
        ).start();
      } else {
        Animated.timing(
          sidebarAnim, { toValue: 1, ...sidebarFMV.visible, duration: 200 }
        ).start(() => {
          dispatch(updatePopup(SIDEBAR_POPUP, false));
        });
      }
    } else if (derivedNote !== null && !isEditorFocused) {
      if (gestureState.dx < 40) {
        Animated.timing(
          rightPanelAnim, { toValue: 0, ...sidebarFMV.visible, duration: 200 }
        ).start();
      } else {
        Animated.timing(
          rightPanelAnim, { toValue: 1, ...sidebarFMV.hidden, duration: 200 }
        ).start(() => {
          dispatch(updateNoteId(null));
        });
      }
    }
  }, [
    isSidebarShown, derivedNote, isEditorFocused, dispatch, sidebarAnim, rightPanelAnim,
  ]);

  const viewPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: shouldSetPanResponder,
      onMoveShouldSetPanResponder: shouldSetPanResponder,
      onPanResponderMove: onPanResponderMove,
      onPanResponderRelease: onPanResponderRelease,
    });
  }, [shouldSetPanResponder, onPanResponderMove, onPanResponderRelease]);

  const onSidebarOpenBtnClick = () => {
    dispatch(updatePopup(SIDEBAR_POPUP, true));
  };

  const onSidebarCloseBtnClick = useCallback(() => {
    dispatch(updatePopup(SIDEBAR_POPUP, false));
  }, [dispatch]);

  const onRightPanelCloseBtnClick = useCallback(() => {
    dispatch(updateNoteId(null, false, true));
  }, [dispatch]);

  const registerSidebarBackHandler = useCallback((isShown) => {
    if (isShown) {
      if (!sidebarBackHandler.current) {
        sidebarBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onSidebarCloseBtnClick();
            return true;
          }
        );
      }
    } else {
      if (sidebarBackHandler.current) {
        sidebarBackHandler.current.remove();
        sidebarBackHandler.current = null;
      }
    }
  }, [onSidebarCloseBtnClick]);

  const registerRightPanelBackHandler = useCallback((isShown) => {
    if (isShown) {
      if (!rightPanelBackHandler.current) {
        rightPanelBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onRightPanelCloseBtnClick();
            return true;
          }
        );
      }
    } else {
      if (rightPanelBackHandler.current) {
        rightPanelBackHandler.current.remove();
        rightPanelBackHandler.current = null;
      }
    }
  }, [onRightPanelCloseBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isSidebarShown) {
      Animated.timing(sidebarAnim, { toValue: 0, ...sidebarFMV.visible }).start(() => {
        if (didMount) setDidSidebarAnimEnd(true);
      });
    } else {
      Animated.timing(sidebarAnim, { toValue: 1, ...sidebarFMV.hidden }).start(() => {
        if (didMount) setDidSidebarAnimEnd(true);
      });
    }

    registerSidebarBackHandler(isSidebarShown);
    return () => {
      didMount = false;
      registerSidebarBackHandler(false);
    };
  }, [isSidebarShown, sidebarAnim, registerSidebarBackHandler]);

  useEffect(() => {
    let didMount = true;
    if (note) {
      Animated.timing(rightPanelAnim, { toValue: 0, ...sidebarFMV.visible }).start();
    } else {
      Animated.timing(rightPanelAnim, { toValue: 1, ...sidebarFMV.hidden }).start(() => {
        if (didMount && !note && note !== derivedNote) setDerivedNote(note);
      });
    }

    registerRightPanelBackHandler(!!note);
    return () => {
      didMount = false;
      registerRightPanelBackHandler(false);
    };
  }, [note, derivedNote, rightPanelAnim, registerRightPanelBackHandler]);

  if (derivedIsSidebarShown !== isSidebarShown) {
    setDidSidebarAnimEnd(false);
    setDerivedIsSidebarShown(isSidebarShown);
  }

  if (note && note !== derivedNote) {
    setDerivedNote(note);
  }

  const leftCanvasClassNames = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0 flex flex-row';
  const leftOverlayStyle = {
    opacity: sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  };
  const leftPanelStyle = {
    transform: [{
      translateX: sidebarAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, -1 * (256 /* (max-w-64) */ + insets.left)],
      }),
    }],
  };

  const rightCanvasClassNames = derivedNote === null ? 'hidden relative' : 'absolute inset-0';
  const rightPanelStyle = {
    transform: [{
      translateX: rightPanelAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, safeAreaWidth + insets.right],
      }),
    }],
  };

  return (
    <View {...viewPanResponder.panHandlers} style={tailwind('flex-1 bg-white')}>
      {/* Main panel */}
      <NoteList onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Sidebar */}
      <View style={tailwind(leftCanvasClassNames)}>
        <TouchableWithoutFeedback onPress={onSidebarCloseBtnClick}>
          <Animated.View style={[tailwind('absolute inset-0 bg-white'), leftOverlayStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[tailwind('absolute top-0 right-0 p-1'), leftOverlayStyle]}>
          <TouchableOpacity onPress={onSidebarCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7')}>
            <Svg width={20} height={20} style={tailwind('text-gray-400 font-normal')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[tailwind('flex-1 max-w-64 h-full bg-gray-100 pr-2'), leftPanelStyle]}>
          <Sidebar />
        </Animated.View>
        <View style={tailwind('flex-shrink-0 w-14 h-full')}>
          {/* Force sidebar to shrink to fit close icon */}
        </View>
      </View>
      {/* Right panel */}
      <View style={tailwind(rightCanvasClassNames)}>
        <Animated.View style={[tailwind('w-full h-full'), rightPanelStyle]}>
          <NoteEditor note={derivedNote} width={safeAreaWidth} />
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(NavPanel);
