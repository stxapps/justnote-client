import React, { useState, useEffect, useRef, useCallback } from 'react';
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

import SettingsPopupAccount from './SettingsPopupAccount';
import {
  SettingsPopupData, SettingsPopupDataExport, SettingsPopupDataDelete,
} from './SettingsPopupData';
import SettingsPopupLists from './SettingsPopupLists';
import SettingsPopupMisc from './SettingsPopupMisc';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;
const VIEW_MISC = 6;

const SIDE_BAR_WIDTH = 224;

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

  const isViewSelected = (refViewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (refViewId === VIEW_DATA) {
      return dataViews.includes(viewId);
    }

    return refViewId === viewId;
  };

  const onPopupCloseBtnClick = useCallback(() => {
    dispatch(updatePopup(SETTINGS_POPUP, false, null));
  }, [dispatch]);

  const onSidebarOpenBtnClick = () => {
    setIsSidebarShown(true);
    setDidSidebarAnimEnd(false);
  };

  const onSidebarCloseBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(false);
  };

  const onAccountBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(false);
    setViewId(VIEW_ACCOUNT);
  };

  const onDataBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(false);
    setViewId(VIEW_DATA);
  };

  const onListsBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(false);
    setViewId(VIEW_LISTS);
  };

  const onMiscBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(false);
    setViewId(VIEW_MISC);
  };

  const onToExportAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_EXPORT);
  };

  const onToDeleteAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_DELETE);
  };

  const onBackToDataViewBtnClick = () => {
    setIsSidebarShown(false);
    setDidSidebarAnimEnd(true);
    setViewId(VIEW_DATA);
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
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
  }, [onPopupCloseBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  useEffect(() => {
    let didMount = true;
    if (isSidebarShown) {
      Animated.timing(sidebarAnim, { toValue: 1, ...sidebarFMV.visible }).start(() => {
        if (didMount) setDidSidebarAnimEnd(true);
      });
    } else {
      Animated.timing(sidebarAnim, { toValue: 0, ...sidebarFMV.hidden }).start(() => {
        if (didMount) setDidSidebarAnimEnd(true);
      });
    }

    return () => {
      didMount = false;
    };
  }, [isSidebarShown, sidebarAnim]);

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
      if (didCloseAnimEnd) {
        setDidCloseAnimEnd(false);
        setViewId(VIEW_ACCOUNT);
        setIsSidebarShown(safeAreaWidth < MD_WIDTH);
        setDidSidebarAnimEnd(true);
      }
    }
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  const _render = (content) => {

    const statusBarHeight = 24;
    const appHeight = safeAreaHeight - statusBarHeight;
    const panelHeight = appHeight * 0.9;

    const sidebarCanvasStyleClasses = !isSidebarShown && didSidebarAnimEnd ? 'hidden relative' : 'absolute inset-0 flex flex-row';

    const sidebarStyle = {
      transform: [{
        translateX: sidebarAnim.interpolate(
          { inputRange: [0, 1], outputRange: [SIDE_BAR_WIDTH * -1, 0] }
        ),
      }],
    };
    const sidebarCloseBtnStyle = { opacity: sidebarAnim };

    const selectedMenuBtnStyleClasses = 'bg-gray-100';
    const menuBtnStyleClasses = '';

    const selectedMenuTextStyleClasses = 'text-gray-800';
    const menuTextStyleClasses = 'text-gray-500';

    const selectedMenuSvgStyleClasses = 'text-gray-500';
    const menuSvgStyleClasses = 'text-gray-400';

    const panelWithSidebar = (
      <View style={{ height: panelHeight }}>
        <View style={tailwind('hidden border-b border-gray-200 md:flex md:mt-6 md:ml-6 md:mr-6', safeAreaWidth)}>
          <Text style={tailwind('pb-4 text-xl text-gray-800 font-medium leading-6')}>Settings</Text>
        </View>
        <View style={tailwind('hidden relative p-1 md:flex md:absolute md:top-0 md:right-0', safeAreaWidth)}>
          <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7')}>
            <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={tailwind('flex-1 flex-row')}>
          {/* Sidebar for desktop */}
          <View style={tailwind('hidden md:flex md:flex-shrink-0 md:flex-grow-0', safeAreaWidth)}>
            <View style={tailwind('mt-2 flex-1 w-48 border-r border-gray-200 md:ml-6 md:mb-6', safeAreaWidth)}>
              <View style={tailwind('mt-2 pr-2 bg-white')}>
                <TouchableOpacity onPress={onAccountBtnClick} style={tailwind(`px-2 py-2 flex-row items-center w-full rounded-md ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_ACCOUNT) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDataBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${isViewSelected(VIEW_DATA) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_DATA) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_DATA) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onListsBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${isViewSelected(VIEW_LISTS) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_LISTS) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_LISTS) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Lists</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onMiscBtnClick} style={tailwind(`mt-1 px-2 py-2 flex-row items-center w-full rounded-md ${isViewSelected(VIEW_MISC) ? selectedMenuBtnStyleClasses : menuBtnStyleClasses}`)}>
                  <Svg style={tailwind(`mr-3 font-normal ${isViewSelected(VIEW_MISC) ? selectedMenuSvgStyleClasses : menuSvgStyleClasses}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                    <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                    <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                  </Svg>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${isViewSelected(VIEW_MISC) ? selectedMenuTextStyleClasses : menuTextStyleClasses}`)}>Misc.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Main panel */}
          <View style={tailwind('flex-shrink flex-grow')}>
            <ScrollView ref={panelContent} style={tailwind('flex-1')} keyboardShouldPersistTaps="handled">
              {content}
              <View style={tailwind('absolute top-0 right-0 p-1 md:hidden md:relative', safeAreaWidth)}>
                <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7')}>
                  <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          {/* Sidebar for mobile */}
          <View style={tailwind(`${sidebarCanvasStyleClasses} md:hidden md:relative`, safeAreaWidth)}>
            <TouchableWithoutFeedback onPress={onSidebarCloseBtnClick}>
              <Animated.View style={[tailwind('absolute inset-0 bg-gray-100'), sidebarCloseBtnStyle]} />
            </TouchableWithoutFeedback>
            <View style={tailwind('absolute top-0 right-0 p-1')}>
              <TouchableOpacity onPress={onPopupCloseBtnClick} style={tailwind('items-center justify-center h-7 w-7')}>
                <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>
            <Animated.View style={[tailwind('pt-5 pb-4 pl-2 flex-1 max-w-56 w-full bg-white'), sidebarStyle]}>
              <View style={tailwind('px-4 flex-shrink-0 flex-row items-center')}>
                <Text style={tailwind('text-xl text-gray-800 font-medium leading-6')}>Settings</Text>
              </View>
              <View style={tailwind('mt-5 px-2')}>
                <TouchableOpacity onPress={onAccountBtnClick} style={tailwind('px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDataBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5C17 5.55228 16.5523 6 16 6H4C3.44772 6 3 5.55228 3 5Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" />
                    <Path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 14.4477 3.44772 14 4 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onListsBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Lists</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onMiscBtnClick} style={tailwind('mt-1 px-2 py-2 flex-row items-center w-full rounded-md')}>
                  <Svg style={tailwind('mr-2 text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" />
                    <Path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" />
                    <Path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" />
                  </Svg>
                  <Text style={tailwind('text-base text-gray-500 font-medium leading-5')}>Misc.</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <View style={tailwind('flex-shrink-0 w-14')}>
              {/* Force sidebar to shrink to fit close icon */}
            </View>
          </View>
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
          <View style={tailwind('absolute inset-0 opacity-25 bg-black')} />
        </TouchableWithoutFeedback>
        <Animated.View style={[tailwind('w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden'), popupStyle]}>
          {panelWithSidebar}
        </Animated.View>
      </View>
    );
  };

  const renderAccountView = () => {
    const content = (
      <SettingsPopupAccount onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderDataView = () => {
    const content = (
      <SettingsPopupData onSidebarOpenBtnClick={onSidebarOpenBtnClick} onToExportAllDataViewBtnClick={onToExportAllDataViewBtnClick} onToDeleteAllDataViewBtnClick={onToDeleteAllDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderExportAllDataView = () => {
    const content = (
      <SettingsPopupDataExport onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderDeleteAllDataView = () => {
    const content = (
      <SettingsPopupDataDelete onBackToDataViewBtnClick={onBackToDataViewBtnClick} />
    );
    return _render(content);
  };

  const renderListsView = () => {
    const content = (
      <SettingsPopupLists onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
    );
    return _render(content);
  };

  const renderMiscView = () => {
    const content = (
      <SettingsPopupMisc onSidebarOpenBtnClick={onSidebarOpenBtnClick} />
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
