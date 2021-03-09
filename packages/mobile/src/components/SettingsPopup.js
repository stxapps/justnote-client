import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updatePopup } from '../actions';
import { SETTINGS_POPUP, MD_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV, sidebarFMV } from '../types/animConfigs';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;
const VIEW_MISC = 6;

const SettingsPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isSettingsPopupShown);

  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [viewId, setViewId] = useState(VIEW_ACCOUNT);
  const [isSidebarShown, setIsSidebarShown] = useState(safeAreaWidth < MD_WIDTH);
  const [didSidebarAnimEnd, setDidSidebarAnimEnd] = useState(true);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);

  const popupAnim = useRef(new Animated.Value(0)).current;
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const panelContent = useRef(null);

  const dispatch = useDispatch();

  /*const isViewSelected = (refViewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (refViewId === VIEW_DATA) {
      return dataViews.includes(viewId);
    }

    return refViewId === viewId;
  }*/

  const onPopupCloseBtnClick = () => {
    dispatch(updatePopup(SETTINGS_POPUP, false, null));
  }

  /*const onSidebarOpenBtnClick = () => {
    setIsSidebarShown(true);
  }

  const onSidebarCloseBtnClick = () => {
    setIsSidebarShown(false);
  }

  const onAccountBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_ACCOUNT);
  }

  const onDataBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_DATA);
  }

  const onListsBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_LISTS);
  }

  const onMiscBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_MISC);
  }

  const onToExportAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_EXPORT);
  }

  const onToDeleteAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_DELETE);
  }

  const onBackToDataViewBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_DATA);
  }*/

  const registerPopupBackHandler = (isShown) => {
    if (isShown) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            onPopupCloseBtnClick();
            return true;
          }
        );
      }
    } else {
      if (popupBackHandler.current) {
        popupBackHandler.current.remove();
        popupBackHandler.current = null;
      }
    }
  };

  useEffect(() => {
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      registerPopupBackHandler(false);
    };
  }, [isShown]);

  useEffect(() => {
    if (isSidebarShown) {
      Animated.timing(sidebarAnim, { toValue: 1, ...sidebarFMV.visible }).start(() => {
        setDidSidebarAnimEnd(true);
      });
    } else {
      Animated.timing(sidebarAnim, { toValue: 0, ...sidebarFMV.hidden }).start(() => {
        setDidSidebarAnimEnd(true);
      });
    }
  }, [isSidebarShown]);

  useEffect(() => {
    if (panelContent.current) {
      setTimeout(() => {
        if (panelContent.current) {
          panelContent.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      }, 1);
    }
  }, [viewId]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) {
      setDidCloseAnimEnd(false);
      setViewId(VIEW_ACCOUNT);
      setIsSidebarShown(safeAreaWidth < MD_WIDTH);
      setDidSidebarAnimEnd(true);
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const _render = (content) => {

    const statusBarHeight = 24;
    const appHeight = safeAreaHeight - statusBarHeight;
    const panelHeight = appHeight * 0.9;

    const panelWithSidebar = (
      <View style={{ height: panelHeight }}>
        <View style={tailwind('hidden relative p-1 md:flex md:absolute md:top-0 md:right-0', safeAreaWidth)}>
          <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
            <Svg style={tailwind('text-base text-gray-500 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={tailwind('hidden border-b border-gray-400 md:flex md:mt-6 md:ml-6 md:mr-6 lg:mt-8 lg:ml-8 lg:mr-8', safeAreaWidth)}>
          <Text style={tailwind('pb-3 text-3xl text-gray-800 font-semibold')}>Settings</Text>
        </View>
        <View style={tailwind('flex-1 flex-row')}>
          {/* Static sidebar for desktop */}

          {/* Content panel */}
          <View style={tailwind('flex-shrink flex-grow')}>
            <ScrollView ref={panelContent} style={tailwind('flex-1')} keyboardShouldPersistTaps="handled">
              {content}
              <View style={tailwind('absolute top-0 right-0 p-1 md:hidden md:relative', safeAreaWidth)}>
                <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7 rounded-full')}>
                  <Svg style={tailwind('text-base text-gray-500 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          {/* Off-canvas sidebar for mobile */}

        </View>
      </View>
    );

    const canvasStyle = { paddingLeft: 16 + insets.left, paddingRight: 16 + insets.right };
    const popupStyle = {
      opacity: popupAnim,
      transform: [
        { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      ],
    };

    return (
      <View style={[tailwind('absolute inset-0 items-center justify-center'), canvasStyle]}>
        <TouchableWithoutFeedback onPress={onPopupCloseBtnClick}>
          <View style={tailwind('absolute inset-0 opacity-25 bg-black')}></View>
        </TouchableWithoutFeedback>
        <Animated.View style={[tailwind('w-full max-w-4xl bg-white rounded-lg shadow-xl'), popupStyle]}>
          {panelWithSidebar}
        </Animated.View>
      </View>
    );
  };

  const renderAccountView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  const renderDataView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  const renderExportAllDataView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  const renderDeleteAllDataView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  const renderListsView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  const renderMiscView = () => {
    const content = (
      <View></View>
    );
    return _render(content);
  };

  if (viewId === VIEW_ACCOUNT) return renderAccountView();
  else if (viewId === VIEW_DATA) return renderDataView();
  else if (viewId === VIEW_DATA_EXPORT) return renderExportAllDataView();
  else if (viewId === VIEW_DATA_DELETE) return renderDeleteAllDataView();
  else if (viewId === VIEW_LISTS) return renderListsView();
  else if (viewId === VIEW_MISC) return renderMiscView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

export default React.memo(SettingsPopup);
