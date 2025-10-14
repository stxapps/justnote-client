import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  moveNotesWithAction, updateMoveAction, updateDeleteAction, updateListNamesMode,
} from '../actions/chunk';
import {
  LIST_NAMES_POPUP, BULK_EDIT_MENU_POPUP, CONFIRM_DELETE_POPUP, MY_NOTES, ARCHIVE,
  TRASH, LG_WIDTH, MOVE_ACTION_NOTE_COMMANDS, DELETE_ACTION_NOTE_COMMANDS,
  LIST_NAMES_MODE_MOVE_NOTES, NOTE_COMMANDS_MODE_NETB,
} from '../types/const';
import { getListNameDisplayName, getRect, adjustRect, toPx } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const NoteCommands = (props) => {

  const {
    mode, isFullScreen, onToggleFullScreen, isOnDarkBackground, isLeftAlign,
  } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const resetDidClickCount = useSelector(state => state.display.resetDidClickCount);
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const moveToBtn = useRef(null);
  const moreBtn = useRef(null);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onArchiveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveNotesWithAction(ARCHIVE, MOVE_ACTION_NOTE_COMMANDS));
    if (isFullScreen) onToggleFullScreen();
    didClick.current = true;
  };

  const onRemoveBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveNotesWithAction(TRASH, MOVE_ACTION_NOTE_COMMANDS));
    if (isFullScreen) onToggleFullScreen();
    didClick.current = true;
  };

  const onRestoreBtnClick = () => {
    if (didClick.current) return;
    dispatch(moveNotesWithAction(MY_NOTES, MOVE_ACTION_NOTE_COMMANDS));
    if (isFullScreen) onToggleFullScreen();
    didClick.current = true;
  };

  const onDeleteBtnClick = () => {
    dispatch(updateDeleteAction(DELETE_ACTION_NOTE_COMMANDS));
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, true, null));
    if (isFullScreen) onToggleFullScreen();
  };

  const onMoveToBtnClick = () => {
    moveToBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateMoveAction(MOVE_ACTION_NOTE_COMMANDS));
      dispatch(updateListNamesMode(LIST_NAMES_MODE_MOVE_NOTES));

      const rect = getRect(x, y, width, height);

      let nRect;
      if (safeAreaWidth < toPx(LG_WIDTH)) {
        nRect = adjustRect(rect, 4, 12, -14, -12);
      } else {
        nRect = adjustRect(rect, 0, -4, 0, 4);
      }
      dispatch(updatePopup(LIST_NAMES_POPUP, true, nRect));
      if (isFullScreen) onToggleFullScreen();
    });
  };

  const onMoreBtnClick = () => {
    moreBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);

      let nRect;
      if (safeAreaWidth < toPx(LG_WIDTH)) {
        nRect = adjustRect(rect, 4, 12, -14, -12);
      } else {
        nRect = adjustRect(rect, 0, -4, 0, 4);
      }
      dispatch(updatePopup(BULK_EDIT_MENU_POPUP, true, nRect));
      if (isFullScreen) onToggleFullScreen();
    });
  };

  useEffect(() => {
    didClick.current = false;
  }, [resetDidClickCount]);

  const rListName = [MY_NOTES, ARCHIVE, TRASH].includes(listName) ? listName : MY_NOTES;

  let isArchiveBtnShown = [MY_NOTES].includes(rListName);
  let isRemoveBtnShown = [MY_NOTES, ARCHIVE].includes(rListName);
  let isRestoreBtnShown = [TRASH].includes(rListName);
  let isDeleteBtnShown = [TRASH].includes(rListName);
  let isMoveToBtnShown = (
    [ARCHIVE].includes(rListName) ||
    (
      (!isUserSignedIn || mode === NOTE_COMMANDS_MODE_NETB) && rListName === MY_NOTES
    )
  );
  let isMoreBtnShown = isUserSignedIn && [MY_NOTES, ARCHIVE].includes(rListName);
  if (queryString) {
    [isArchiveBtnShown, isRemoveBtnShown, isRestoreBtnShown] = [false, true, false];
    [isDeleteBtnShown, isMoveToBtnShown, isMoreBtnShown] = [false, false, true];
  }
  if (mode === NOTE_COMMANDS_MODE_NETB) isMoreBtnShown = false;

  let btnClassNames;
  if (isOnDarkBackground) btnClassNames = 'border-white bg-white lg:border-gray-300';
  else btnClassNames = 'border-white bg-white blk:border-gray-900 blk:bg-gray-900 lg:border-gray-300 lg:blk:border-gray-600';

  if (isLeftAlign) btnClassNames += ' lg:mr-3';
  else btnClassNames += ' lg:ml-3';

  let textClassNames;
  if (isOnDarkBackground) textClassNames = 'text-gray-600';
  else textClassNames = 'text-gray-500 blk:text-gray-400';

  return (
    <React.Fragment>
      {isArchiveBtnShown && <TouchableOpacity onPress={onArchiveBtnClick} style={[tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`), { maxWidth: 128 }]}>
        <View style={tailwind('rounded p-2 lg:flex-shrink-0 lg:flex-grow-0 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind(`font-normal ${textClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5C2 5.53043 2.21071 6.03914 2.58579 6.41421C2.96086 6.78929 3.46957 7 4 7H16C16.5304 7 17.0391 6.78929 17.4142 6.41421C17.7893 6.03914 18 5.53043 18 5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4Z" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V8ZM8 11C8 10.7348 8.10536 10.4804 8.29289 10.2929C8.48043 10.1054 8.73478 10 9 10H11C11.2652 10 11.5196 10.1054 11.7071 10.2929C11.8946 10.4804 12 10.7348 12 11C12 11.2652 11.8946 11.5196 11.7071 11.7071C11.5196 11.8946 11.2652 12 11 12H9C8.73478 12 8.48043 11.8946 8.29289 11.7071C8.10536 11.5196 8 11.2652 8 11Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex lg:flex-shrink lg:flex-grow ${textClassNames}`)} numberOfLines={1} ellipsizeMode="tail">{getListNameDisplayName(ARCHIVE, listNameMap)}</Text>
      </TouchableOpacity>}
      {isRemoveBtnShown && <TouchableOpacity onPress={onRemoveBtnClick} style={tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`)}>
        <View style={tailwind('rounded p-2 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind(`font-normal ${textClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.81434 2.0001 8.63237 2.05188 8.47447 2.14955C8.31658 2.24722 8.18899 2.38692 8.106 2.553L7.382 4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6C16.2652 6 16.5196 5.89464 16.7071 5.70711C16.8946 5.51957 17 5.26522 17 5C17 4.73478 16.8946 4.48043 16.7071 4.29289C16.5196 4.10536 16.2652 4 16 4H12.618L11.894 2.553C11.811 2.38692 11.6834 2.24722 11.5255 2.14955C11.3676 2.05188 11.1857 2.0001 11 2H9ZM7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7C8.26522 7 8.51957 7.10536 8.70711 7.29289C8.89464 7.48043 9 7.73478 9 8V14C9 14.2652 8.89464 14.5196 8.70711 14.7071C8.51957 14.8946 8.26522 15 8 15C7.73478 15 7.48043 14.8946 7.29289 14.7071C7.10536 14.5196 7 14.2652 7 14V8ZM12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8V14C11 14.2652 11.1054 14.5196 11.2929 14.7071C11.4804 14.8946 11.7348 15 12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex ${textClassNames}`)}>Remove</Text>
      </TouchableOpacity>}
      {isRestoreBtnShown && <TouchableOpacity onPress={onRestoreBtnClick} style={tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`)}>
        <View style={tailwind('rounded p-2 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind(`font-normal ${textClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7.70703 3.293C7.8945 3.48053 7.99982 3.73484 7.99982 4C7.99982 4.26516 7.8945 4.51947 7.70703 4.707L5.41403 7H11C12.8565 7 14.637 7.7375 15.9498 9.05025C17.2625 10.363 18 12.1435 18 14V16C18 16.2652 17.8947 16.5196 17.7071 16.7071C17.5196 16.8946 17.2652 17 17 17C16.7348 17 16.4805 16.8946 16.2929 16.7071C16.1054 16.5196 16 16.2652 16 16V14C16 12.6739 15.4732 11.4021 14.5356 10.4645C13.5979 9.52678 12.3261 9 11 9H5.41403L7.70703 11.293C7.80254 11.3852 7.87872 11.4956 7.93113 11.6176C7.98354 11.7396 8.01113 11.8708 8.01228 12.0036C8.01344 12.1364 7.98813 12.2681 7.93785 12.391C7.88757 12.5139 7.81332 12.6255 7.71943 12.7194C7.62553 12.8133 7.51388 12.8875 7.39098 12.9378C7.26809 12.9881 7.13641 13.0134 7.00363 13.0123C6.87085 13.0111 6.73963 12.9835 6.61763 12.9311C6.49562 12.8787 6.38528 12.8025 6.29303 12.707L2.29303 8.707C2.10556 8.51947 2.00024 8.26516 2.00024 8C2.00024 7.73484 2.10556 7.48053 2.29303 7.293L6.29303 3.293C6.48056 3.10553 6.73487 3.00021 7.00003 3.00021C7.26519 3.00021 7.5195 3.10553 7.70703 3.293Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex ${textClassNames}`)}>Restore</Text>
      </TouchableOpacity>}
      {isDeleteBtnShown && <TouchableOpacity onPress={onDeleteBtnClick} style={tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`)}>
        <View style={tailwind('rounded p-2 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind('font-normal text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.81434 2.0001 8.63237 2.05188 8.47447 2.14955C8.31658 2.24722 8.18899 2.38692 8.106 2.553L7.382 4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6C16.2652 6 16.5196 5.89464 16.7071 5.70711C16.8946 5.51957 17 5.26522 17 5C17 4.73478 16.8946 4.48043 16.7071 4.29289C16.5196 4.10536 16.2652 4 16 4H12.618L11.894 2.553C11.811 2.38692 11.6834 2.24722 11.5255 2.14955C11.3676 2.05188 11.1857 2.0001 11 2H9ZM7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7C8.26522 7 8.51957 7.10536 8.70711 7.29289C8.89464 7.48043 9 7.73478 9 8V14C9 14.2652 8.89464 14.5196 8.70711 14.7071C8.51957 14.8946 8.26522 15 8 15C7.73478 15 7.48043 14.8946 7.29289 14.7071C7.10536 14.5196 7 14.2652 7 14V8ZM12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8V14C11 14.2652 11.1054 14.5196 11.2929 14.7071C11.4804 14.8946 11.7348 15 12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex ${textClassNames}`)}>Permanently Delete</Text>
      </TouchableOpacity>}
      {isMoveToBtnShown && <TouchableOpacity ref={moveToBtn} onPress={onMoveToBtnClick} style={tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`)}>
        <View style={tailwind('rounded p-2 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind(`font-normal ${textClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M7 3C6.73478 3 6.48043 3.10536 6.29289 3.29289C6.10536 3.48043 6 3.73478 6 4C6 4.26522 6.10536 4.51957 6.29289 4.70711C6.48043 4.89464 6.73478 5 7 5H13C13.2652 5 13.5196 4.89464 13.7071 4.70711C13.8946 4.51957 14 4.26522 14 4C14 3.73478 13.8946 3.48043 13.7071 3.29289C13.5196 3.10536 13.2652 3 13 3H7ZM4 7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H15C15.2652 6 15.5196 6.10536 15.7071 6.29289C15.8946 6.48043 16 6.73478 16 7C16 7.26522 15.8946 7.51957 15.7071 7.70711C15.5196 7.89464 15.2652 8 15 8H5C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7ZM2 11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H16C16.5304 9 17.0391 9.21071 17.4142 9.58579C17.7893 9.96086 18 10.4696 18 11V15C18 15.5304 17.7893 16.0391 17.4142 16.4142C17.0391 16.7893 16.5304 17 16 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex ${textClassNames}`)}>Move to</Text>
      </TouchableOpacity>}
      {isMoreBtnShown && <TouchableOpacity ref={moreBtn} onPress={onMoreBtnClick} style={tailwind(`h-full flex-row items-center border pl-1 pr-1 sm:pl-2 lg:rounded-md lg:px-2 lg:py-2 lg:shadow-xs ${btnClassNames}`)}>
        <View style={tailwind('rounded p-2 lg:p-0')}>
          <Svg width={20} height={20} style={tailwind(`font-normal ${textClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.73478 3.10536 4.48043 3.29289 4.29289C3.48043 4.10536 3.73478 4 4 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8946 4.48043 17 4.73478 17 5C17 5.26522 16.8946 5.51957 16.7071 5.70711C16.5196 5.89464 16.2652 6 16 6H4C3.73478 6 3.48043 5.89464 3.29289 5.70711C3.10536 5.51957 3 5.26522 3 5ZM3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H10C10.2652 9 10.5196 9.10536 10.7071 9.29289C10.8946 9.48043 11 9.73478 11 10C11 10.2652 10.8946 10.5196 10.7071 10.7071C10.5196 10.8946 10.2652 11 10 11H4C3.73478 11 3.48043 10.8946 3.29289 10.7071C3.10536 10.5196 3 10.2652 3 10ZM3 15C3 14.7348 3.10536 14.4804 3.29289 14.2929C3.48043 14.1054 3.73478 14 4 14H16C16.2652 14 16.5196 14.1054 16.7071 14.2929C16.8946 14.4804 17 14.7348 17 15C17 15.2652 16.8946 15.5196 16.7071 15.7071C16.5196 15.8946 16.2652 16 16 16H4C3.73478 16 3.48043 15.8946 3.29289 15.7071C3.10536 15.5196 3 15.2652 3 15Z" />
          </Svg>
        </View>
        <Text style={tailwind(`hidden text-sm font-normal lg:ml-1 lg:flex ${textClassNames}`)}>More actions</Text>
      </TouchableOpacity>}
    </React.Fragment>
  );
};

export default React.memo(NoteCommands);
