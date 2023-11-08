import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateNoteIdUrlHash, updateNoteId, updateBulkEditUrlHash, showNLIMPopup,
  addSelectedNoteIds, deleteSelectedNoteIds, updateQueryString,
} from '../actions';
import { LG_WIDTH } from '../types/const';
import { makeIsNoteIdSelected, makeGetNoteDate, makeGetTnAndDns } from '../selectors';
import {
  isNumber, isBusyStatus, isPinningStatus, isTaggingStatus, stripHtml,
} from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const NoteListItemContent = (props) => {

  const { note, pinStatus, tagStatus } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const getIsNoteIdSelected = useMemo(makeIsNoteIdSelected, []);
  const getNoteDate = useMemo(makeGetNoteDate, []);
  const getTnAndDns = useMemo(makeGetTnAndDns, []);
  const isBulkEditing = useSelector(state => state.display.isBulkEditing);
  const isSelected = useSelector(state => getIsNoteIdSelected(state, note.id));
  const noteDate = useSelector(state => getNoteDate(state, note));
  const tnAndDns = useSelector(state => getTnAndDns(state, note));
  const [viewPbMode, setViewPbMode] = useState(0);
  const [doTitlePb, setDoTitlePb] = useState(false);
  const body = useMemo(() => stripHtml(note.body), [note.body]);
  const isBusy = useMemo(() => {
    const isPinning = isPinningStatus(pinStatus);
    const isTagging = isTaggingStatus(tagStatus);
    return isBusyStatus(note.status) || isPinning || isTagging;
  }, [note.status, pinStatus, tagStatus]);
  const clickPressTimer = useRef(null);
  const touchPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const pBodyRef = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onClickPress = () => {
    clickPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!isBulkEditing) {
        dispatch(updateBulkEditUrlHash(true, isBusy ? null : note.id, false, true));
      }
    }, 500);
  };

  const onClickCancel = () => {
    if (clickPressTimer.current) {
      clearTimeout(clickPressTimer.current);
      clickPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onClickPressRelease = () => {
    if (clickPressTimer.current) {
      clearTimeout(clickPressTimer.current);
      if (!isLongPress.current) {
        if (isBulkEditing) {
          if (!isBusy) {
            if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
            else dispatch(addSelectedNoteIds([note.id]));
          }
        } else {
          if (safeAreaWidth < LG_WIDTH) {
            dispatch(updateNoteIdUrlHash(note.id, false, true));
          } else {
            dispatch(updateNoteId(note.id, false, true));
          }
        }
      }
      clickPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onTouchPress = () => {
    touchPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!isBulkEditing) {
        dispatch(updateBulkEditUrlHash(true, isBusy ? null : note.id, false, true));
      }
    }, 500);
  };

  const onTouchCancel = () => {
    if (touchPressTimer.current) {
      clearTimeout(touchPressTimer.current);
      touchPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onTouchPressRelease = (e) => {
    if (e.cancelable) e.preventDefault();
    if (touchPressTimer.current) {
      clearTimeout(touchPressTimer.current);
      if (!isLongPress.current) {
        if (isBulkEditing) {
          if (!isBusy) {
            if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
            else dispatch(addSelectedNoteIds([note.id]));
          }
        } else {
          if (safeAreaWidth < LG_WIDTH) {
            dispatch(updateNoteIdUrlHash(note.id, false, true));
          } else {
            dispatch(updateNoteId(note.id, false, true));
          }
        }
      }
      touchPressTimer.current = null;
      isLongPress.current = false;
    }
  };

  const onMenuBtnClick = (e) => {
    const _rect = e.currentTarget.getBoundingClientRect();
    const newX = _rect.x + 12;
    const newY = _rect.y + 4;
    const newWidth = _rect.width - 12 - 8;
    const newHeight = _rect.height - 4 - 4;
    const rect = {
      x: newX, y: newY, width: newWidth, height: newHeight,
      top: newY, bottom: newY + newHeight, left: newX, right: newX + newWidth,
    };
    dispatch(showNLIMPopup(note.id, rect, true));
  };

  useEffect(() => {
    return () => {
      clearTimeout(clickPressTimer.current);
      clearTimeout(touchPressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!pBodyRef.current || !isNumber(pBodyRef.current.clientHeight)) return;
    const height = pBodyRef.current.clientHeight;

    let _viewPbMode = 0;
    if ((note && note.title) || noteDate) {
      if (height <= 44) _viewPbMode = 1;
      if (height <= 24) _viewPbMode = 2;
    }

    let _doTitlePb = false;
    if (((note && note.title) || noteDate) && body) {
      if (height >= 22) _doTitlePb = true;
    }

    if (viewPbMode !== _viewPbMode) setViewPbMode(_viewPbMode);
    if (doTitlePb !== _doTitlePb) setDoTitlePb(_doTitlePb);
  }, [viewPbMode, doTitlePb, note, body, noteDate, setViewPbMode, setDoTitlePb]);

  const circleClassNames = isSelected ? 'bg-green-600 border-green-700' : 'bg-gray-200 border-gray-300';
  const checkClassNames = isSelected ? 'text-white' : 'text-gray-400';

  let viewClassNames = 'py-4', tagClassNames = '-mt-3.5 pb-3.5';
  if (viewPbMode === 1) {
    viewClassNames = 'pt-4 pb-3.5';
    tagClassNames = '-mt-3.5 pb-3.5';
  } else if (viewPbMode === 2) {
    viewClassNames = 'pt-4 pb-2';
    tagClassNames = '-mt-4 pb-3.5';
  }

  const titleClassNames = doTitlePb ? 'pb-1.5' : '';

  const titleTabIndex = note.title ? 0 : -1;
  const bodyTabIndex = note.title ? -1 : 0;

  const renderTags = () => {
    if (tnAndDns.length === 0) return null;

    return (
      <div className={tailwind(`pl-3 pr-3 sm:pl-5 ${tagClassNames}`)}>
        <div className={tailwind('flex flex-wrap items-center justify-start pt-1')}>
          {tnAndDns.map((tnAndDn, i) => {
            return (
              <button key={tnAndDn.tagName} onClick={() => dispatch(updateQueryString(tnAndDn.tagName, true))} className={tailwind(`group mt-2 block max-w-full rounded-full bg-gray-100 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-0 blk:bg-gray-700 blk:focus:ring-gray-500 blk:focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${i === 0 ? '' : 'ml-2'} ${isBulkEditing ? '' : 'hover:bg-gray-200 blk:hover:bg-gray-600'}`)} disabled={isBulkEditing}>
                <div className={tailwind(`truncate text-xs text-gray-500 blk:text-gray-300 ${isBulkEditing ? '' : 'group-hover:text-gray-700 blk:group-hover:text-gray-100'}`)}>{tnAndDn.displayName}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className={tailwind(`group flex items-center rounded-sm pl-3 sm:pl-5 ${viewClassNames}`)}>
        {(isBulkEditing && !isBusy) && <button onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className={tailwind(`mr-3 flex h-10 w-10 items-center justify-center rounded-full border focus:outline-none ${circleClassNames}`)}>
          <svg className={tailwind(`h-6 w-6 ${checkClassNames}`)} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </svg>
        </button>}
        <div className={tailwind('min-w-0 flex-1')}>
          {(note.title || noteDate) && <div className={tailwind('pr-3')}>
            {/* Add pb (titleClassNames) in button, not in div above, to make no clickable gap but ring is misaligned. */}
            <button tabIndex={titleTabIndex} onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className={tailwind(`flex w-full items-center justify-between rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 blk:focus-visible:ring-gray-500 blk:focus-visible:ring-offset-gray-900 ${titleClassNames}`)}>
              <h3 className={tailwind('min-w-0 flex-1 truncate text-left text-base font-semibold text-gray-800 group-hover:underline blk:text-gray-100 lg:text-sm')}>{note.title}</h3>
              <p className={tailwind('ml-3 flex-shrink-0 flex-grow-0 whitespace-nowrap text-left text-xs text-gray-400 blk:text-gray-500')}>{noteDate}</p>
            </button>
          </div>}
          <div className={tailwind(`flex items-center justify-between ${isBulkEditing ? 'pr-3' : ''}`)}>
            <button tabIndex={bodyTabIndex} onTouchStart={onTouchPress} onTouchMove={onTouchCancel} onTouchEnd={onTouchPressRelease} onTouchCancel={onTouchCancel} onMouseDown={onClickPress} onMouseUp={onClickPressRelease} onMouseLeave={onClickCancel} className={tailwind('min-h-[2.625rem] w-full min-w-0 flex-1 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 blk:focus-visible:ring-gray-500 blk:focus-visible:ring-offset-gray-900')}>
              <p ref={pBodyRef} className={tailwind('text-left text-sm text-gray-500 line-clamp-3 blk:text-gray-400')}>{body}</p>
            </button>
            {!isBulkEditing && <button onClick={onMenuBtnClick} className={tailwind('flex-shrink-0 flex-grow-0 py-1 pl-4 pr-2 text-gray-400 focus:outline-none blk:text-gray-500 group-s')} disabled={isBusy}>
              <svg className={tailwind('w-[1.125rem] rounded-full py-2 group-s-hover:bg-gray-200 group-s-focus-visible:bg-gray-200 blk:group-s-hover:bg-gray-700 blk:group-s-hover:text-gray-400 blk:group-s-focus-visible:bg-gray-700 blk:group-s-focus-visible:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
              </svg>
            </button>}
          </div>
        </div>
      </div>
      {renderTags()}
    </React.Fragment>
  );
};

export default React.memo(NoteListItemContent);
