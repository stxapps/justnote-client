import React, { useState, useEffect, useRef } from 'react';
import {
  View, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updateNoteId } from '../actions';
import { tailwind } from '../stylesheets/tailwind';
import { sidebarFMV } from '../types/animConfigs';

import Sidebar from './Sidebar';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const NavPanel = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const noteId = useSelector(state => state.display.noteId);

  const [isSidebarShown, setIsSidebarShown] = useState(false);
  const [didSidebarAnimEnd, setDidSidebarAnimEnd] = useState(true);
  const [derivedIsSidebarShown, setDerivedIsSidebarShown] = useState(isSidebarShown);
  const sidebarAnim = useRef(new Animated.Value(1)).current;
  const sidebarBackHandler = useRef(null);

  const [didRightPanelAnimEnd, setDidRightPanelAnimEnd] = useState(true);
  const [derivedNoteId, setDerivedNoteId] = useState(noteId);
  const rightPanelAnim = useRef(new Animated.Value(1)).current;
  const rightPanelBackHandler = useRef(null);

  const dispatch = useDispatch();

  const onSidebarOpenBtnClick = () => {
    setIsSidebarShown(true);
  };

  const onSidebarCloseBtnClick = () => {
    setIsSidebarShown(false);
  };

  const onRightPanelCloseBtnClick = () => {
    dispatch(updateNoteId(null));
  };

  const registerSidebarBackHandler = (isShown) => {
    if (isShown) {
      if (!sidebarBackHandler.current) {
        sidebarBackHandler.current = BackHandler.addEventListener(
          "hardwareBackPress",
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
  };

  const registerRightPanelBackHandler = (isShown) => {
    if (isShown) {
      if (!rightPanelBackHandler.current) {
        rightPanelBackHandler.current = BackHandler.addEventListener(
          "hardwareBackPress",
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
  };

  useEffect(() => {
    if (isSidebarShown) {
      Animated.timing(sidebarAnim, { toValue: 0, ...sidebarFMV.visible }).start(() => {
        setDidSidebarAnimEnd(true);
      });
    } else {
      Animated.timing(sidebarAnim, { toValue: 1, ...sidebarFMV.hidden }).start(() => {
        setDidSidebarAnimEnd(true);
      });
    }

    registerSidebarBackHandler(isSidebarShown);
    return () => {
      registerSidebarBackHandler(false);
    };
  }, [isSidebarShown]);

  useEffect(() => {
    if (noteId) {
      Animated.timing(rightPanelAnim, { toValue: 0, ...sidebarFMV.visible }).start(() => {
        setDidRightPanelAnimEnd(true);
      });
    } else {
      Animated.timing(rightPanelAnim, { toValue: 1, ...sidebarFMV.hidden }).start(() => {
        setDidRightPanelAnimEnd(true);
      });
    }

    registerRightPanelBackHandler(!!noteId);
    return () => {
      registerRightPanelBackHandler(false);
    };
  }, [noteId]);

  if (derivedIsSidebarShown !== isSidebarShown) {
    setDidSidebarAnimEnd(false);
    setDerivedIsSidebarShown(isSidebarShown);
  }

  if (derivedNoteId !== noteId) {
    setDidRightPanelAnimEnd(false);
    setDerivedNoteId(noteId);
  }

  const leftCanvasClassNames = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0 flex flex-row';
  const leftOverlayStyle = {
    opacity: sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  };
  const leftPanelStyle = {
    transform: [{
      translateX: sidebarAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, -1 * (256 /* (max-w-64) */ + insets.left)]
      })
    }]
  };

  const rightCanvasClassNames = noteId === null && didRightPanelAnimEnd ? 'hidden relative' : 'absolute inset-0';
  const rightPanelStyle = {
    transform: [{
      translateX: rightPanelAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, safeAreaWidth + insets.right]
      })
    }]
  };

  return (
    <View style={tailwind('flex-1 bg-white')}>
      {/* Main panel */}
      <NoteList onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
      {/* Sidebar */}
      <View style={tailwind(leftCanvasClassNames)}>
        <TouchableWithoutFeedback onPress={onSidebarCloseBtnClick}>
          <Animated.View style={[tailwind('absolute inset-0 bg-white'), leftOverlayStyle]}></Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View style={[tailwind('absolute top-0 right-0 p-1'), leftOverlayStyle]}>
          <TouchableOpacity onPress={onSidebarCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
            <Svg width={20} height={20} style={tailwind('text-gray-500 font-normal')} stroke="currentColor" fill="none" viewBox="0 0 24 24">
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
          <NoteEditor onRightPanelCloseBtnClick={onRightPanelCloseBtnClick} width={safeAreaWidth} />
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(NavPanel);
