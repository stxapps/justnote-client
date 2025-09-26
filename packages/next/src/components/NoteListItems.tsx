import React, { useEffect, useRef, useMemo, useCallback } from 'react';

import { useSelector, useDispatch } from '../store';
import { fetchMore, updateFetchedMore } from '../actions/chunk';
import { ADDED_DT, UPDATED_DT } from '../types/const';
import {
  getNotes, getIsFetchingMore, getHasFetchedMore, getDoSectionNotesByMonth,
} from '../selectors';
import { isObject, throttle, getFullYearMonth } from '../utils';
import vars from '../vars';

import { useTailwind } from '.';

import NoteListItem from './NoteListItem';
import EmptyContent from './EmptyContent';

const SHOW_MONTH_HEAD = 'SHOW_MONTH_HEAD';

const NoteListItems = (props) => {

  const notes = useSelector(state => getNotes(state));
  const hasMore = useSelector(state => state.display.hasMoreNotes);
  const isFetchingMore = useSelector(state => getIsFetchingMore(state));
  const hasFetchedMore = useSelector(state => getHasFetchedMore(state));
  const listChangedCount = useSelector(state => state.display.listChangedCount);
  const sortOn = useSelector(state => state.settings.sortOn);
  const doSectionNotesByMonth = useSelector(state => getDoSectionNotesByMonth(state));
  const flatList = useRef(null);
  const hasMoreRef = useRef(hasMore);
  const hasFetchedMoreRef = useRef(hasFetchedMore);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const items = useMemo(() => {
    if (!isObject(notes)) {
      console.log(`Invalid notes: ${notes}. If notes is null, it should be handled in NoteList, not in NoteListItems.`);
      return [];
    }

    const { sortedCfNts, pinnedNotes, noPinnedNotes } = notes;

    let prevMonth = null;

    const _items = Array.isArray(sortedCfNts) ? [...sortedCfNts] : [];
    if (Array.isArray(pinnedNotes)) _items.push(...pinnedNotes);
    if (Array.isArray(noPinnedNotes)) {
      for (const note of noPinnedNotes) {
        if (doSectionNotesByMonth) {
          let dt = note.addedDT;
          if (sortOn === ADDED_DT) { /* do nothing here */ }
          else if (sortOn === UPDATED_DT) dt = note.updatedDT;
          else console.log(`Invalid sortOn: ${sortOn}`);

          const { year, month } = getFullYearMonth(dt);
          if (month !== prevMonth) {
            _items.push({ id: `${SHOW_MONTH_HEAD}-${year}-${month}`, year, month });
          }

          prevMonth = month;
        }

        _items.push(note);
      }
    }

    return _items;
  }, [notes, sortOn, doSectionNotesByMonth]);

  const updateScrollY = useCallback(() => {
    if (!flatList.current) return;

    const scrollHeight = Math.max(
      flatList.current.scrollHeight,
      flatList.current.offsetHeight,
      flatList.current.clientHeight,
    );
    const windowHeight = Math.min(
      flatList.current.offsetHeight, flatList.current.clientHeight,
    );
    const scrollTop = flatList.current.scrollTop;

    vars.scrollPanel.contentHeight = scrollHeight;
    vars.scrollPanel.layoutHeight = windowHeight;
    vars.scrollPanel.scrollY = scrollTop;

    if (
      !hasMoreRef.current || hasFetchedMoreRef.current || isFetchingMoreRef.current
    ) return;

    const windowBottom = windowHeight + scrollTop;
    if (windowBottom > (scrollHeight * 0.96)) dispatch(fetchMore());
  }, [dispatch]);

  const onFetchMoreBtnClick = () => {
    dispatch(fetchMore());
  };

  const onUpdateFetchedBtnClick = () => {
    dispatch(updateFetchedMore());
  };

  const renderEmpty = () => {
    vars.scrollPanel.scrollY = 0;
    return <EmptyContent />;
  };

  const renderFetchMoreBtn = () => {
    return (
      <div className={tailwind('my-6 px-4 sm:px-6')}>
        <button onClick={onFetchMoreBtnClick} className={tailwind('flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-xs hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-500 blk:bg-gray-900 blk:text-gray-400 blk:hover:border-gray-400 blk:hover:text-gray-300 blk:focus:border-gray-400 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>More</button>
      </div>
    );
  };

  const renderFetchingMore = () => {
    return (
      <div className={tailwind('my-6 flex items-center justify-center')}>
        <div className={tailwind('lds-ellipsis')}>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
          <div className={tailwind('bg-gray-400 blk:bg-gray-400')}></div>
        </div>
      </div>
    );
  };

  const renderUpdateFetchedBtn = () => {
    return (
      <div className={tailwind('my-6 px-4 sm:px-6')}>
        <button onClick={onUpdateFetchedBtnClick} className={tailwind('flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-xs hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-500 blk:bg-gray-900 blk:text-gray-400 blk:hover:border-gray-400 blk:hover:text-gray-300 blk:focus:border-gray-400 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>Show more</button>
      </div>
    );
  };

  const renderItems = () => {
    return (
      <div className={tailwind('mt-5')}>
        <ul className={tailwind('-my-5 divide-y divide-gray-200 blk:divide-gray-700')}>
          {items.map(item => {
            if (item.id.startsWith(SHOW_MONTH_HEAD)) {
              return (
                <div key={item.id} className={tailwind('bg-gray-100 py-1 pl-4 blk:bg-gray-800 sm:pl-6 lg:bg-gray-50 lg:blk:bg-gray-800')}>
                  <p className={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400 lg:text-xs')}>{item.month} {item.year}</p>
                </div>
              );
            }
            return <NoteListItem key={item.id} note={item} />;
          })}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    if (flatList.current) {
      setTimeout(() => {
        if (flatList.current) {
          flatList.current.scrollTo(0, 0);
          vars.scrollPanel.scrollY = 0;
        }
      }, 1);
    }
  }, [listChangedCount]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    hasFetchedMoreRef.current = hasFetchedMore;
    isFetchingMoreRef.current = isFetchingMore;
  }, [hasMore, hasFetchedMore, isFetchingMore]);

  useEffect(() => {
    // throttle may refer to stale updateScrollY with old isFetchingMore,
    //   use refs to access current values to prevent duplicate fetchMore.
    const listener = throttle(updateScrollY, 16);

    const _flatList = flatList.current;
    if (_flatList && _flatList.addEventListener) {
      _flatList.addEventListener('scroll', listener);
    }
    return () => {
      if (_flatList && _flatList.addEventListener) {
        _flatList.removeEventListener('scroll', listener);
      }
    };
  }, [updateScrollY]);

  let fetchMoreBtn;
  if (!hasMore) fetchMoreBtn = null;
  else if (hasFetchedMore) fetchMoreBtn = renderUpdateFetchedBtn();
  else if (isFetchingMore) fetchMoreBtn = renderFetchingMore();
  else fetchMoreBtn = renderFetchMoreBtn();

  return (
    <div ref={flatList} className={tailwind('h-full overflow-y-auto pb-[5.5rem] lg:pb-0')}>
      {items.length === 0 && renderEmpty()}
      {items.length > 0 && renderItems()}
      {fetchMoreBtn}
    </div>
  );
};

export default React.memo(NoteListItems);
