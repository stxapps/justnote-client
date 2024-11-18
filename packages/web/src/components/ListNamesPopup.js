import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

import { updatePopupUrlHash } from '../actions';
import {
  moveNotes, moveToListName, updateSettingsPopup, updateSettingsViewId,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, TRASH, LIST_NAMES_MODE_MOVE_NOTES, LIST_NAMES_MODE_MOVE_LIST_NAME,
  SETTINGS_VIEW_LISTS,
} from '../types/const';
import { getListNameMap } from '../selectors';
import {
  getLastHalfHeight, getListNameObj, getLongestListNameDisplayName,
  getMaxListNameChildrenSize,
} from '../utils';
import { popupBgFMV, popupFMV, slideFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';
import { computePosition, createLayouts, getOriginClassName } from './MenuPopupRenderer';

const MODE_MOVE_NOTES = LIST_NAMES_MODE_MOVE_NOTES;
const MODE_MOVE_LIST_NAME = LIST_NAMES_MODE_MOVE_LIST_NAME;

const ListNamesPopup = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isListNamesPopupShown);
  const anchorPosition = useSelector(state => state.display.listNamesPopupPosition);
  const mode = useSelector(state => state.display.listNamesMode);
  const listName = useSelector(state => state.display.listName);
  const selectingListName = useSelector(state => state.display.selectingListName);
  const listNameMap = useSelector(getListNameMap);

  const [currentListName, setCurrentListName] = useState(null);
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
  const slideAnim = useMotionValue('0%');
  const cancelBtn = useRef(null);
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

  const onCancelBtnClick = () => {
    if (didClick.current) return;
    updatePopupUrlHash(LIST_NAMES_POPUP, false, null);
    didClick.current = true;
  };

  const onNewBtnClick = () => {
    if (didClick.current) return;
    onCancelBtnClick();

    // As this and closing listNames popup both call window.history.back(),
    //   need to be in different js clock cycle.
    setTimeout(() => {
      dispatch(updateSettingsViewId(SETTINGS_VIEW_LISTS, false));
      dispatch(updateSettingsPopup(true));
    }, 100);
    didClick.current = true;
  };

  const onLnItemBtnClick = (selectedListName) => {
    if (didClick.current) return;
    onCancelBtnClick();
    if (derivedMode === MODE_MOVE_LIST_NAME) {
      dispatch(moveToListName(derivedSelectingListName, selectedListName));
    } else if (derivedMode === MODE_MOVE_NOTES) {
      // As this and closing listNames popup both call window.history.back(),
      //   need to be in different js clock cycle.
      setTimeout(() => dispatch(moveNotes(selectedListName)), 100);
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
      // As this and closing listNames popup both call window.history.back(),
      //   need to be in different js clock cycle.
      setTimeout(() => {
        if (currentListName) dispatch(moveNotes(currentListName));
      }, 100);
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
    const transition = /** @type import('framer-motion').Tween */({
      ...slideFMV,
      onComplete: () => {
        setCurrentListName(selectedListName);
        setForwardCount(forwardCount + 1);
      }
    });
    animate(slideAnim, '-100%', transition);
  };

  useEffect(() => {
    if (derivedIsShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [derivedIsShown, derivedMode]);

  useEffect(() => {
    const transition = /** @type import('framer-motion').Tween */({ ...slideFMV });
    const controls = animate(slideAnim, '0%', transition);
    return () => controls.stop();
  }, [backCount, slideAnim]);

  if (derivedIsShown !== isShown || derivedMode !== mode) {
    if (
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

  if (!derivedIsShown || !derivedAnchorPosition) return (
    <AnimatePresence key="AP_lnPopup" />
  );

  if (forwardCount !== prevForwardCount) {
    slideAnim.set('0%');
    setPrevForwardCount(forwardCount);
  }
  if (backCount !== prevBackCount) {
    slideAnim.set('-100%');
    setPrevBackCount(backCount);
  }

  let popupWidth = 168;
  if (longestDisplayName.length > 26) popupWidth = 256;
  else if (longestDisplayName.length > 14) popupWidth = 208;

  let popupHeight = Math.min(315, 44 * (maxChildrenSize + 1) + 51);
  if (maxChildrenSize > 4) {
    popupHeight = getLastHalfHeight(
      Math.min(popupHeight, safeAreaHeight - 16), 44, 0, 51, 0.5
    );
  } else if (maxChildrenSize > 3) {
    popupHeight = Math.min(popupHeight, safeAreaHeight - 16);
  }

  const renderListNameBtns = () => {
    return (
      <div className={tailwind('-mt-0.5')}>
        {children.map(obj => {
          let btnClassNames = 'py-3';
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
            <div key={obj.listName} className={tailwind('flex w-full flex-row items-center justify-start')}>
              <button onClick={() => onLnItemBtnClick(obj.listName)} className={tailwind(`group flex min-w-0 flex-shrink flex-grow flex-row items-center pl-4 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none blk:hover:bg-gray-700 blk:focus:bg-gray-700 ${btnClassNames}`)} disabled={disabled}>
                <p className={tailwind(`truncate text-left text-sm ${disabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-700 group-hover:text-gray-900 group-focus:text-gray-900 blk:text-gray-200 blk:group-hover:text-white blk:group-focus:text-white'}`)}>{obj.displayName}</p>
              </button>
              {(obj.children && obj.children.length > 0) && <button onClick={() => onForwardBtnClick(obj.listName)} className={tailwind('group flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center focus:outline-none')} disabled={forwardDisabled}>
                <svg className={tailwind(`h-5 w-5 rounded ${forwardDisabled ? 'text-gray-300 blk:text-gray-600' : 'text-gray-500 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-offset-0 group-focus:ring-gray-400 blk:text-gray-300 blk:group-hover:text-gray-100 blk:group-focus:ring-gray-500'}`)} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.7069C7.10556 14.5194 7.00024 14.2651 7.00024 13.9999C7.00024 13.7348 7.10556 13.4804 7.29303 13.2929L10.586 9.99992L7.29303 6.70692C7.11087 6.51832 7.01008 6.26571 7.01236 6.00352C7.01463 5.74132 7.1198 5.49051 7.30521 5.3051C7.49062 5.11969 7.74143 5.01452 8.00363 5.01224C8.26583 5.00997 8.51843 5.11076 8.70703 5.29292L12.707 9.29292C12.8945 9.48045 12.9998 9.73475 12.9998 9.99992C12.9998 10.2651 12.8945 10.5194 12.707 10.7069L8.70703 14.7069C8.5195 14.8944 8.26519 14.9997 8.00003 14.9997C7.73487 14.9997 7.48056 14.8944 7.29303 14.7069Z" />
                </svg>
              </button>}
            </div>
          );
        })}
      </div>
    );
  };

  const _render = () => {
    const displayName = currentListName ? listNameObj.displayName : 'Move to';
    const contentStyle = { x: slideAnim };

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
      <div className={tailwind('flex h-full w-full flex-col')}>
        <div className={tailwind('flex h-11 w-full flex-shrink-0 flex-grow-0 items-center justify-start pt-1')}>
          {currentListName && <button onClick={() => onBackBtnClick(parent)} className={tailwind('group h-10 flex-shrink-0 flex-grow-0 items-center justify-center pl-2.5 pr-1 focus:outline-none')}>
            <svg className={tailwind('h-5 w-5 rounded text-gray-500 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-gray-400 group-focus:ring-offset-0 blk:text-gray-300 blk:group-hover:text-gray-100 blk:group-focus:ring-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.707 5.29303C12.8945 5.48056 12.9998 5.73487 12.9998 6.00003C12.9998 6.26519 12.8945 6.5195 12.707 6.70703L9.41403 10L12.707 13.293C12.8892 13.4816 12.99 13.7342 12.9877 13.9964C12.9854 14.2586 12.8803 14.5094 12.6948 14.6948C12.5094 14.8803 12.2586 14.9854 11.9964 14.9877C11.7342 14.99 11.4816 14.8892 11.293 14.707L7.29303 10.707C7.10556 10.5195 7.00024 10.2652 7.00024 10C7.00024 9.73487 7.10556 9.48056 7.29303 9.29303L11.293 5.29303C11.4806 5.10556 11.7349 5.00024 12 5.00024C12.2652 5.00024 12.5195 5.10556 12.707 5.29303Z" />
            </svg>
          </button>}
          <p className={tailwind(`flex-shrink flex-grow truncate text-sm font-semibold text-gray-600 blk:text-gray-200 ${currentListName ? 'pr-4' : 'px-4'}`)}>{displayName}</p>
          {derivedMode === MODE_MOVE_NOTES && <button onClick={onNewBtnClick} className={tailwind('group flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center focus:outline-none')}>
            <svg className={tailwind('h-5 w-5 rounded text-gray-500 group-hover:text-gray-700 group-focus:ring-2 group-focus:ring-gray-400 group-focus:ring-offset-0 blk:text-gray-300 blk:group-hover:text-gray-100 blk:group-focus:ring-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />
            </svg>
          </button>}
        </div>
        <div className={tailwind('flex w-full flex-1 flex-col overflow-hidden')}>
          <motion.div className={tailwind('flex-1 overflow-auto')} style={contentStyle}>
            {renderListNameBtns()}
          </motion.div>
        </div>
        <div className={tailwind('flex w-full flex-shrink-0 flex-grow-0 flex-row items-center justify-end border-t border-gray-200 px-3 py-2.5 blk:border-gray-600')}>
          <button onClick={onMoveHereBtnClick} className={tailwind(`rounded-md border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:bg-gray-800 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-800 ${moveHereDisabled ? 'border-gray-300 blk:border-gray-600' : 'border-gray-400 hover:border-gray-500 blk:border-gray-400 blk:hover:border-gray-300'} ${moveHereDisabled ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 hover:text-gray-600 blk:text-gray-300 blk:hover:text-gray-200'}`)} disabled={moveHereDisabled}>
            {moveHereDisabled ? 'View only' : 'Move here'}
          </button>
        </div>
      </div>
    );
  };

  const layouts = createLayouts(
    derivedAnchorPosition,
    { width: popupWidth, height: popupHeight },
    { width: safeAreaWidth, height: safeAreaHeight }
  );
  const popupPosition = computePosition(layouts, null, 8);

  const { top, left, topOrigin, leftOrigin } = popupPosition;
  const popupStyle = { top, left, width: popupWidth, height: popupHeight };
  const popupClassNames = getOriginClassName(topOrigin, leftOrigin);

  const panel = (
    <motion.div key="LNP_popup" style={popupStyle} className={tailwind(`fixed overflow-auto rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-white blk:ring-opacity-25 ${popupClassNames}`)} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
      {_render()}
    </motion.div>
  );

  return (
    <AnimatePresence key="AP_lnPopup">
      <motion.button key="LNP_cancelBtn" ref={cancelBtn} onClick={onCancelBtnClick} className={tailwind('fixed inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden" />
      {panel}
    </AnimatePresence>
  );
};

export default React.memo(ListNamesPopup);
