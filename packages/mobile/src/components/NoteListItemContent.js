import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updateNoteId, updateBulkEdit, addSelectedNoteIds, deleteSelectedNoteIds,
} from '../actions';
import { showNLIMPopup, updateQueryString } from '../actions/chunk';
import { makeIsNoteIdSelected, makeGetNoteDate, makeGetTnAndDns } from '../selectors';
import {
  isBusyStatus, isPinningStatus, isTaggingStatus, stripHtml, getRect, adjustRect,
} from '../utils';

import { useTailwind } from '.';

const NoteListItemContent = (props) => {

  const { note, pinStatus, tagStatus } = props;
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
  const menuBtn = useRef(null);
  const pBodyRef = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onContentBtnClick = () => {
    if (isBulkEditing) {
      if (!isBusy) {
        if (isSelected) dispatch(deleteSelectedNoteIds([note.id]));
        else dispatch(addSelectedNoteIds([note.id]));
      }
    } else {
      dispatch(updateNoteId(note.id, false, true));
    }
  };

  const onContentBtnLongClick = () => {
    if (!isBulkEditing) {
      dispatch(updateBulkEdit(true, isBusy ? null : note.id, false, true));
    }
  };

  const onMenuBtnClick = () => {
    menuBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = getRect(x, y, width, height);
      const nRect = adjustRect(rect, 12, 4, -20, -8);
      dispatch(showNLIMPopup(note.id, nRect, true));
    });
  };

  useEffect(() => {
    // If no setTimeout, height is 0.
    setTimeout(() => {
      if (!pBodyRef.current) return;
      pBodyRef.current.measure((_fx, _fy, width, height, x, y) => {
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
      });
    }, 1);
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

  const renderTags = () => {
    if (tnAndDns.length === 0) return null;

    return (
      <View style={tailwind(`pl-3 pr-3 sm:pl-5 ${tagClassNames}`)}>
        <View style={tailwind('flex-row flex-wrap items-center justify-start pt-1')}>
          {tnAndDns.map((tnAndDn, i) => {
            return (
              <TouchableOpacity key={tnAndDn.tagName} onPress={() => dispatch(updateQueryString(tnAndDn.tagName, true))} style={tailwind(`mt-2 max-w-full rounded-full bg-gray-100 px-2 py-1 blk:bg-gray-700 ${i === 0 ? '' : 'ml-2'}`)} disabled={isBulkEditing}>
                <Text style={tailwind('text-xs font-normal text-gray-500 blk:text-gray-300')} numberOfLines={1} ellipsizeMode="tail">{tnAndDn.displayName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      <View style={tailwind(`w-full flex-row items-center rounded-sm pl-3 sm:pl-5 ${viewClassNames}`)}>
        {(isBulkEditing && !isBusy) && <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind(`mr-3 h-10 w-10 items-center justify-center rounded-full border ${circleClassNames}`)}>
          <Svg style={tailwind(`h-6 w-6 font-normal ${checkClassNames}`)} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" />
          </Svg>
        </TouchableOpacity>}
        <View style={tailwind('flex-1')}>
          {(note.title || noteDate) && <View style={tailwind('pr-3')}>
            <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={tailwind(`w-full flex-row items-center justify-between rounded-sm ${titleClassNames}`)}>
              <View style={tailwind('flex-1')}>
                <Text style={tailwind('text-left text-base font-semibold text-gray-800 blk:text-gray-100 lg:text-sm')} numberOfLines={1} ellipsizeMode="tail">{note.title}</Text>
              </View>
              <View style={tailwind('ml-3 flex-shrink-0 flex-grow-0')}>
                <Text style={tailwind('text-left text-xs font-normal text-gray-400 blk:text-gray-500')}>{noteDate}</Text>
              </View>
            </TouchableOpacity>
          </View>}
          <View style={tailwind(`flex-row items-center justify-between ${isBulkEditing ? 'pr-3' : ''}`)}>
            <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} onLongPress={onContentBtnLongClick} style={[tailwind('w-full flex-1 items-start justify-center rounded-sm'), { minHeight: 42 }]}>
              <View ref={pBodyRef} collapsable={false}>
                <Text style={tailwind('text-left text-sm font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{body}</Text>
              </View>
            </TouchableOpacity>
            {!isBulkEditing && <TouchableOpacity ref={menuBtn} activeOpacity={1.0} onPress={onMenuBtnClick} style={tailwind('flex-shrink-0 flex-grow-0 py-3 pl-4 pr-2')} disabled={isBusy}>
              <Svg width={18} height={18} style={tailwind('font-normal text-gray-400 blk:text-gray-500')} viewBox="0 0 20 20" fill="currentColor">
                <Path d="M10 6C9.46957 6 8.96086 5.78929 8.58579 5.41421C8.21071 5.03914 8 4.53043 8 4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2C10.5304 2 11.0391 2.21071 11.4142 2.58579C11.7893 2.96086 12 3.46957 12 4C12 4.53043 11.7893 5.03914 11.4142 5.41421C11.0391 5.78929 10.5304 6 10 6ZM10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12ZM10 18C9.46957 18 8.96086 17.7893 8.58579 17.4142C8.21071 17.0391 8 16.5304 8 16C8 15.4696 8.21071 14.9609 8.58579 14.5858C8.96086 14.2107 9.46957 14 10 14C10.5304 14 11.0391 14.2107 11.4142 14.5858C11.7893 14.9609 12 15.4696 12 16C12 16.5304 11.7893 17.0391 11.4142 17.4142C11.0391 17.7893 10.5304 18 10 18Z" />
              </Svg>
            </TouchableOpacity>}
          </View>
        </View>
      </View>
      {renderTags()}
    </React.Fragment>
  );
};

export default React.memo(NoteListItemContent);
