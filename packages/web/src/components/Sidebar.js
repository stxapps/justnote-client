import React, { useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateNoteId, updatePopupUrlHash } from '../actions';
import { NEW_NOTE, PROFILE_POPUP } from '../types/const';

import SidebarSearchInput from './SidebarSearchInput';
import SidebarListNames from './SidebarListNames';
import LoadingSidebarListNames from './LoadingSidebarListNames';

import logoFull from '../images/logo-full.svg';

const Sidebar = () => {

  const didFetch = useSelector(state => state.display.didFetch);
  const username = useSelector(state => state.user.username);
  const userImage = useSelector(state => state.user.image);
  const profileBtn = useRef(null);
  const dispatch = useDispatch();

  const onProfileBtnClick = () => {
    updatePopupUrlHash(PROFILE_POPUP, true, profileBtn.current.getBoundingClientRect());
  };

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE, false, true));
  };

  const derivedUsername = useMemo(() => {
    const suffixes = ['.id', '.id.blockstack', '.id.stx'];

    let name = username || 'My Username';
    for (const suffix of suffixes) {
      if (name.endsWith(suffix)) name = name.slice(0, -1 * suffix.length);
    }

    return name;
  }, [username]);

  const derivedUserImage = useMemo(() => {
    if (userImage) {
      return (
        <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src={userImage} alt="Profile" />
      );
    }

    return (
      <svg className="w-10 h-10 flex-shrink-0 text-gray-200 group-hover:text-gray-300" viewBox="0 0 96 96" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="48" />
        <path d="M82.5302 81.3416C73.8015 90.3795 61.5571 96 47.9999 96C34.9627 96 23.1394 90.8024 14.4893 82.3663C18.2913 78.3397 22.7793 74.9996 27.7572 72.5098C34.3562 69.2093 41.6342 67.4938 49.0126 67.5C62.0922 67.5 73.9409 72.7881 82.5302 81.3416Z" fill="#A0AEC0" />
        <path d="M57.9629 57.4535C60.3384 55.0781 61.6729 51.8562 61.6729 48.4968C61.6729 45.1374 60.3384 41.9156 57.9629 39.5401C55.5875 37.1647 52.3656 35.8302 49.0062 35.8302C45.6468 35.8302 42.425 37.1647 40.0495 39.5401C37.6741 41.9156 36.3396 45.1374 36.3396 48.4968C36.3396 51.8562 37.6741 55.0781 40.0495 57.4535C42.425 59.829 45.6468 61.1635 49.0062 61.1635C52.3656 61.1635 55.5875 59.829 57.9629 57.4535Z" fill="#A0AEC0" />
      </svg>
    );
  }, [userImage]);

  const listNames = didFetch ? <SidebarListNames /> : <LoadingSidebarListNames />;

  return (
    <div className="flex flex-col w-full min-w-56 h-full pt-5 pb-4 bg-gray-100">
      <div className="flex items-center flex-shrink-0 px-6">
        <img className="h-8 w-auto" src={logoFull} alt="Justnote" />
      </div>
      <div className="h-0 flex-1 flex flex-col">
        {/* User account dropdown
              No lg:block here and mt-6 on SidebarSearchInput instead of mt-5
              as no use profileBtn for now */}
        <div className="hidden pl-3 pr-1 mt-6 relative text-left">
          <button ref={profileBtn} onClick={onProfileBtnClick} type="button" className="group w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200" aria-haspopup="true" aria-expanded="true">
            <span className="flex w-full justify-between items-center">
              <span className="flex-1 flex min-w-0 items-center justify-between space-x-3">
                {derivedUserImage}
                <span className="flex-1 min-w-0">
                  <span className="text-gray-900 text-sm font-medium truncate">{derivedUsername}</span>
                </span>
              </span>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
        {/* Sidebar Search */}
        <SidebarSearchInput />
        {/* Add Button */}
        <div className="hidden pl-3 pr-1 mt-6 lg:block">
          <button onClick={onAddBtnClick} type="button" className="py-2 w-full bg-green-600 text-sm font-medium text-white border border-green-600 rounded-md shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-600">
            <div className="w-full h-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                <svg className="mr-3 h-4 w-4 text-white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V9H14C14.2652 9 14.5196 9.10536 14.7071 9.29289C14.8946 9.48043 15 9.73478 15 10C15 10.2652 14.8946 10.5196 14.7071 10.7071C14.5196 10.8946 14.2652 11 14 11H11V14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14V11H6C5.73478 11 5.48043 10.8946 5.29289 10.7071C5.10536 10.5196 5 10.2652 5 10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H9V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z" />
                </svg>
              </div>
              <div className="pl-9 text-left">New Note</div>
            </div>
          </button>
        </div>
        {/* List Names */}
        {listNames}
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
