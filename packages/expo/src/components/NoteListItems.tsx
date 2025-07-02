import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';

import { useSelector, useDispatch } from '../store';
import { fetchMore, updateFetchedMore } from '../actions/chunk';
import { LG_WIDTH, BLK_MODE, ADDED_DT, UPDATED_DT } from '../types/const';
import {
  getNotes, getHasMoreNotes, getIsFetchingMore, getHasFetchedMore, getThemeMode,
  getDoSectionNotesByMonth,
} from '../selectors';
import { isObject, getFullYearMonth } from '../utils';
import vars from '../vars';

import { useSafeAreaFrame, useTailwind } from '.';

import NoteListItem from './NoteListItem';
import EmptyContent from './EmptyContent';

const SHOW_FETCH_MORE_BTN = 'SHOW_FETCH_MORE_BTN';
const SHOW_FETCHING_MORE = 'SHOW_FETCHING_MORE';
const SHOW_UPDATE_FETCHED_BTN = 'SHOW_UPDATE_FETCHED_BTN';
const SHOW_EMPTY_SPACE = 'SHOW_EMPTY_SPACE';
const SHOW_MONTH_HEAD = 'SHOW_MONTH_HEAD';

const NoteListItems = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const notes = useSelector(state => getNotes(state));
  const hasMore = useSelector(state => getHasMoreNotes(state));
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const hasFetchedMore = useSelector(state => getHasFetchedMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const sortOn = useSelector(state => state.settings.sortOn);
  const doSectionNotesByMonth = useSelector(state => getDoSectionNotesByMonth(state));
  const themeMode = useSelector(state => getThemeMode(state));
  const flatList = useRef(null);
  const hasMoreRef = useRef(hasMore);
  const hasFetchedMoreRef = useRef(hasFetchedMore);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const data = useMemo(() => {
    if (!isObject(notes)) {
      console.log(`Invalid notes: ${notes}. If notes is null, it should be handled in NoteList, not in NoteListItems.`);
      return [];
    }

    const { sortedCfNts, pinnedNotes, noPinnedNotes } = notes;

    let prevMonth = null;

    const _data = Array.isArray(sortedCfNts) ? [...sortedCfNts] : [];
    if (Array.isArray(pinnedNotes)) _data.push(...pinnedNotes);
    if (Array.isArray(noPinnedNotes)) {
      for (const note of noPinnedNotes) {
        if (doSectionNotesByMonth) {
          let dt = note.addedDT;
          if (sortOn === ADDED_DT) { /* do nothing here */ }
          else if (sortOn === UPDATED_DT) dt = note.updatedDT;
          else console.log(`Invalid sortOn: ${sortOn}`);

          const { year, month } = getFullYearMonth(dt);
          if (month !== prevMonth) {
            _data.push({ id: `${SHOW_MONTH_HEAD}-${year}-${month}`, year, month });
          }

          prevMonth = month;
        }

        _data.push(note);
      }
    }

    if (!hasMore) { /* Do nothing */ }
    else if (hasFetchedMore) _data.push({ id: SHOW_UPDATE_FETCHED_BTN });
    else if (isFetchingMore) _data.push({ id: SHOW_FETCHING_MORE });
    else _data.push({ id: SHOW_FETCH_MORE_BTN });

    if (_data.length > 0 && safeAreaWidth < LG_WIDTH) {
      _data.push({ id: SHOW_EMPTY_SPACE });
    }

    return _data;
  }, [
    notes, hasMore, isFetchingMore, hasFetchedMore, safeAreaWidth, sortOn,
    doSectionNotesByMonth,
  ]);

  const onScroll = useCallback((e) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;
    const scrollY = e.nativeEvent.contentOffset.y;

    vars.scrollPanel.contentHeight = contentHeight;
    vars.scrollPanel.layoutHeight = layoutHeight;
    vars.scrollPanel.scrollY = scrollY;
  }, []);

  const onFetchMoreBtnClick = useCallback(() => {
    dispatch(fetchMore());
  }, [dispatch]);

  const onUpdateFetchedBtnClick = useCallback(() => {
    dispatch(updateFetchedMore());
  }, [dispatch]);

  const onEndReached = useCallback(() => {
    if (
      !hasMoreRef.current || hasFetchedMoreRef.current || isFetchingMoreRef.current
    ) return;

    dispatch(fetchMore());
  }, [dispatch]);

  const getItemId = useCallback((item) => {
    return item.id;
  }, []);

  const renderEmpty = useCallback(() => {
    vars.scrollPanel.scrollY = 0;
    return <EmptyContent />;
  }, []);

  const renderFetchMoreBtn = useCallback(() => {
    return (
      <View style={tailwind('my-6 px-4 sm:px-6')}>
        <TouchableOpacity onPress={onFetchMoreBtnClick} style={tailwind('w-full items-center rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm blk:border-gray-500 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-medium text-gray-500 blk:text-gray-400')}>More</Text>
        </TouchableOpacity>
      </View>
    );
  }, [onFetchMoreBtnClick, tailwind]);

  const renderFetchingMore = useCallback(() => {
    return (
      <View style={tailwind('my-6 w-full flex-row justify-center py-2')}>
        <Flow size={48} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(156, 163, 175)'} />
      </View>
    );
  }, [themeMode, tailwind]);

  const renderUpdateFetchedBtn = useCallback(() => {
    return (
      <View style={tailwind('my-6 px-4 sm:px-6')}>
        <TouchableOpacity onPress={onUpdateFetchedBtnClick} style={tailwind('w-full items-center rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm blk:border-gray-500 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-medium text-gray-500 blk:text-gray-400')}>Show more</Text>
        </TouchableOpacity>
      </View>
    );
  }, [onUpdateFetchedBtnClick, tailwind]);

  const renderItem = useCallback(({ item }) => {
    if (item.id.startsWith(SHOW_MONTH_HEAD)) {
      return (
        <View style={tailwind('border-b border-gray-200 bg-gray-100 py-1 pl-4 blk:border-gray-700 blk:bg-gray-800 sm:pl-6 lg:bg-gray-50 lg:blk:bg-gray-800')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400 lg:text-xs')}>{item.month} {item.year}</Text>
        </View>
      );
    }
    if (item.id === SHOW_FETCH_MORE_BTN) return renderFetchMoreBtn();
    if (item.id === SHOW_FETCHING_MORE) return renderFetchingMore();
    if (item.id === SHOW_UPDATE_FETCHED_BTN) return renderUpdateFetchedBtn();
    if (item.id === SHOW_EMPTY_SPACE) {
      return (
        <View style={[tailwind('w-full bg-white blk:bg-gray-900'), { height: 88 }]} />
      );
    }
    return <NoteListItem note={item} />;
  }, [renderFetchMoreBtn, renderFetchingMore, renderUpdateFetchedBtn, tailwind]);

  useEffect(() => {
    setTimeout(() => {
      if (flatList.current) {
        flatList.current.scrollToOffset({ offset: 0, animated: true });
      }
      vars.scrollPanel.scrollY = 0;
    }, 1);
  }, [listChangedCount]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    hasFetchedMoreRef.current = hasFetchedMore;
    isFetchingMoreRef.current = isFetchingMore;
  }, [hasMore, hasFetchedMore, isFetchingMore]);

  return (
    <FlatList
      ref={flatList}
      data={data}
      keyExtractor={getItemId}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      removeClippedSubviews={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      overScrollMode="always" />
  );
};

export default React.memo(NoteListItems);
