import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView, View, TouchableOpacity, TouchableWithoutFeedback, Animated, BackHandler,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  moveNotes, moveToListName, updateSettingsPopup, updateSettingsViewId,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, TRASH, LIST_NAMES_MODE_MOVE_NOTES, LIST_NAMES_MODE_MOVE_LIST_NAME,
  SETTINGS_VIEW_LISTS,
} from '../types/const';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import { popupFMV, slideFMV } from '../types/animConfigs';
import { computePositionTranslate } from '../utils/popup';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';
import Text from './CustomText';

const MODE_MOVE_NOTES = LIST_NAMES_MODE_MOVE_NOTES;
const MODE_MOVE_LIST_NAME = LIST_NAMES_MODE_MOVE_LIST_NAME;

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);
  const mode = useSelector(state => state.display.listNamesMode);
  const listName = useSelector(state => state.display.listName);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameMap = useSelector(state => state.settings.listNameMap);

  const [currentListName, setCurrentListName] = useState(null);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const [derivedMode, setDerivedMode] = useState(mode);
  const [derivedListName, setDerivedListName] = useState(listName);
  const [derivedSelectingListName, setDerivedSelectingListName] = useState(
    selectingListName
  );
  const [derivedListNameMap, setDerivedListNameMap] = useState(listNameMap);

  const [forwardCount, setForwardCount] = useState(0);
  const [prevForwardCount, setPrevForwardCount] = useState(forwardCount);
  const [backCount, setBackCount] = useState(0);
  const [prevBackCount, setPrevBackCount] = useState(backCount);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const { listNameObj, parent, children } = useMemo(() => {
    const { listNameObj: obj, parent: p } = getListNameObj(
      currentListName, derivedListNameMap
    );
    const c = currentListName === null ? derivedListNameMap : obj.children;
    return { listNameObj: obj, parent: p, children: c };
  }, [currentListName, derivedListNameMap]);
  const longestDisplayName = useMemo(() => {
    return getLongestListNameDisplayName(derivedListNameMap);
  }, [derivedListNameMap]);
  const maxChildrenSize = useMemo(() => {
    return getMaxListNameChildrenSize(derivedListNameMap);
  }, [derivedListNameMap]);

  const onCancelBtnClick = useCallback(() => {
    if (didClick.current) return;
    dispatch(updatePopup(LIST_NAMES_POPUP, false, null));
    didClick.current = true;
  }, [dispatch]);

  const onNewBtnClick = () => {
    if (didClick.current) return;

    dispatch(updateSettingsViewId(SETTINGS_VIEW_LISTS, false));
    dispatch(updateSettingsPopup(true, false, LIST_NAMES_POPUP));
    didClick.current = true;
  };

  const onLnItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, selectedListName));
    } else if (derivedMode === MODE_MOVE_NOTES) {
      dispatch(moveNotes(selectedListName));
    } else {
      console.log('In ListNamesPopup.onLnItemBtnClick, invalid mode:', derivedMode);
    }
    didClick.current = true;
  };

  const onMoveHereBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, currentListName));
    } else if (derivedMode === MODE_MOVE_NOTES) {
      if (currentListName) dispatch(moveNotes(currentListName));
    } else {
      console.log('In ListNamesPopup.onMoveHereBtnClick, invalid mode:', derivedMode);
    }
    didClick.current = true;
  };

  const onBackBtnClick = (selectedListName) => {
    setCurrentListName(selectedListName);
    setBackCount(backCount + 1);
  };

  const onForwardBtnClick = (selectedListName) => {
    Animated.timing(slideAnim, { toValue: 1, ...slideFMV }).start(() => {
      requestAnimationFrame(() => {
        setCurrentListName(selectedListName);
        requestAnimationFrame(() => {
          setForwardCount(forwardCount + 1);
        });
      });
    });
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onCancelBtnClick();
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
  }, [onCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (derivedIsShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        requestAnimationFrame(() => {
          if (didMount) {
            setDidCloseAnimEnd(true);
          }
        });
      });
    }

    registerPopupBackHandler(derivedIsShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [derivedIsShown, popupAnim, registerPopupBackHandler]);

  useEffect(() => {
    if (derivedIsShown) {
      didClick.current = false;
    }
  }, [derivedIsShown, derivedMode]);

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 0, ...slideFMV }).start();
  }, [backCount, slideAnim]);

  if (derivedIsShown !== isShown || derivedMode !== mode) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    else if (
      (!derivedIsShown && isShown) ||
      (derivedIsShown && isShown && derivedMode !== mode)
    ) {
      setDerivedAnchorPosition(anchorPosition);
      setDerivedListName(listName);
      setDerivedSelectingListName(selectingListName);
      setDerivedListNameMap(listNameMap);

      if (mode === MODE_MOVE_LIST_NAME) {
        const { parent: p } = getListNameObj(selectingListName, listNameMap);
        setCurrentListName(p);
      } else {
        const { parent: p } = getListNameObj(listName, listNameMap);
        setCurrentListName(p);
      }
    }
    if (derivedIsShown !== isShown) setDerivedIsShown(isShown);
    if (derivedMode !== mode) setDerivedMode(mode);
  }

  if (!derivedIsShown && didCloseAnimEnd) return null;
  if (!derivedAnchorPosition) return null;

  if (forwardCount !== prevForwardCount) {
    slideAnim.setValue(0);
    setPrevForwardCount(forwardCount);
  }
  if (backCount !== prevBackCount) {
    slideAnim.setValue(1);
    setPrevBackCount(backCount);
  }

  // Only on iPhone, if line height is 20, the text height is 22.7,
  //   so must use height and verticle center on menu items instead of py-[x].

  let popupWidth = 168;
  if (longestDisplayName.length > 26) popupWidth = 256;
  else if (longestDisplayName.length > 14) popupWidth = 208;

  let popupHeight = 44 + (44 * maxChildrenSize) + 52;
  if (popupHeight > safeAreaHeight - 16) {
    popupHeight = getLastHalfHeight(
      Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 52, 0.5
    );
  }

  const renderListNameBtns = () => {
    return (
      <View style={tailwind('-mt-0.5')}>
        {children.map(obj => {
          let btnClassNames = 'h-11';
          if (!obj.children || obj.children.length === 0) btnClassNames += ' pr-4';

          let disabled = false, forwardDisabled = false;
          if (derivedMode === MODE_MOVE_LIST_NAME) {
            const { parent: p } = getListNameObj(
              derivedSelectingListName, derivedListNameMap
            );
            disabled = [TRASH, derivedSelectingListName, p].includes(obj.listName);
            forwardDisabled = [TRASH, derivedSelectingListName].includes(obj.listName);
          } else if (derivedMode === MODE_MOVE_NOTES) {
            disabled = [TRASH, derivedListName].includes(obj.listName);
            forwardDisabled = [TRASH].includes(obj.listName);
          }

          return (
            <View key={obj.listName} style={tailwind('w-full flex-row items-center justify-start')}>
              <TouchableOpacity onPress={() => onLnItemBtnClick(obj.listName)} style={tailwind(`flex-shrink flex-grow flex-row items-center pl-4 ${btnClassNames}`)} disabled={disabled}>
                <Text style={tailwind(`text-sm font-normal ${disabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-700 blk:text-gray-200'}`)} numberOfLines={1} ellipsizeMode="tail">{obj.displayName}</Text>
              </TouchableOpacity>
              {(obj.children && obj.children.length > 0) && <TouchableOpacity onPress={() => onForwardBtnClick(obj.listName)} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')} disabled={forwardDisabled}>
                <Svg style={tailwind(`font-normal ${forwardDisabled ? 'text-gray-300 blk:text-gray-600' : 'text-gray-500 blk:text-gray-300'}`)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.7069C7.10556 14.5194 7.00024 14.2651 7.00024 13.9999C7.00024 13.7348 7.10556 13.4804 7.29303 13.2929L10.586 9.99992L7.29303 6.70692C7.11087 6.51832 7.01008 6.26571 7.01236 6.00352C7.01463 5.74132 7.1198 5.49051 7.30521 5.3051C7.49062 5.11969 7.74143 5.01452 8.00363 5.01224C8.26583 5.00997 8.51843 5.11076 8.70703 5.29292L12.707 9.29292C12.8945 9.48045 12.9998 9.73475 12.9998 9.99992C12.9998 10.2651 12.8945 10.5194 12.707 10.7069L8.70703 14.7069C8.5195 14.8944 8.26519 14.9997 8.00003 14.9997C7.73487 14.9997 7.48056 14.8944 7.29303 14.7069Z" />
                </Svg>
              </TouchableOpacity>}
            </View>
          );
        })}
      </View>
    );
  };

  const _render = () => {
    const displayName = currentListName ? listNameObj.displayName : 'Move to';
    const contentStyle = {
      transform: [
        {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1], outputRange: [0, -1 * popupWidth],
          }),
        },
      ],
    };

    let moveHereDisabled = false;
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      const { parent: p } = getListNameObj(derivedSelectingListName, derivedListNameMap);
      moveHereDisabled = [TRASH, p].includes(currentListName);
    } else if (derivedMode === MODE_MOVE_NOTES) {
      moveHereDisabled = (
        !currentListName || [TRASH, derivedListName].includes(currentListName)
      );
    }

    return (
      <React.Fragment>
        <View style={tailwind('h-11 flex-row items-center justify-start pt-1')}>
          {currentListName && <TouchableOpacity onPress={() => onBackBtnClick(parent)} style={tailwind('h-10 flex-shrink-0 flex-grow-0 items-center justify-center pl-2.5 pr-1')}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </Svg>
          </TouchableOpacity>}
          <Text style={tailwind(`flex-shrink flex-grow text-sm font-semibold text-gray-600 blk:text-gray-200 ${currentListName ? 'pr-4' : 'px-4'}`)} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
          {derivedMode === MODE_MOVE_NOTES && <TouchableOpacity onPress={onNewBtnClick} style={tailwind('h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')}>
            <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-300')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />
            </Svg>
          </TouchableOpacity>}
        </View>
        <View style={tailwind('flex-1 overflow-hidden')}>
          <Animated.View style={[tailwind('flex-1'), contentStyle]}>
            <ScrollView>{renderListNameBtns()}</ScrollView>
          </Animated.View>
        </View>
        <View style={tailwind('h-13 flex-shrink-0 flex-grow-0 flex-row items-center justify-end border-t border-gray-200 px-3 blk:border-gray-600')}>
          <TouchableOpacity onPress={onMoveHereBtnClick} style={tailwind(`rounded-md border bg-white px-3 py-1.5 blk:bg-gray-800 ${moveHereDisabled ? 'border-gray-300 blk:border-gray-600' : 'border-gray-400 blk:border-gray-400'}`)} disabled={moveHereDisabled}>
            <Text style={tailwind(`text-xs font-normal ${moveHereDisabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 blk:text-gray-300'}`)}>{moveHereDisabled ? 'View only' : 'Move here'}</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  };

  const posTrn = computePositionTranslate(
    derivedAnchorPosition,
    { width: popupWidth, height: popupHeight },
    { width: safeAreaWidth, height: safeAreaHeight },
    null,
    insets,
    8,
  );

  const popupStyle = {
    top: posTrn.top, left: posTrn.left,
    width: popupWidth, height: popupHeight,
    opacity: popupAnim, transform: [],
  };
  popupStyle.transform.push({
    translateX: popupAnim.interpolate({
      inputRange: [0, 1], outputRange: [posTrn.startX, 0],
    }),
  });
  popupStyle.transform.push({
    translateY: popupAnim.interpolate({
      inputRange: [0, 1], outputRange: [posTrn.startY, 0],
    }),
  });
  popupStyle.transform.push({
    scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
  });

  const panel = (
    <Animated.View style={[tailwind('absolute rounded-md bg-white shadow-xl blk:border blk:border-gray-700 blk:bg-gray-800'), popupStyle]}>
      {_render()}
    </Animated.View>
  );

  const bgStyle = { opacity: popupAnim };

  return (
    <View style={tailwind('absolute inset-0')}>
      <TouchableWithoutFeedback onPress={onCancelBtnClick}>
        <Animated.View style={[tailwind('absolute inset-0 bg-black bg-opacity-25'), bgStyle]} />
      </TouchableWithoutFeedback>
      {panel}
    </View>
  );
};

export default React.memo(ListNamesPopup);
