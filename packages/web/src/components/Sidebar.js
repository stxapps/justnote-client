import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';

import { updateNoteId, updatePopupUrlHash } from '../actions';
import { NEW_NOTE, PROFILE_POPUP } from '../types/const';

import SidebarSearchInput from './SidebarSearchInput';
import SidebarListNames from './SidebarListNames';

import logoFull from '../images/logo-full.svg';

const Sidebar = () => {

  const profileBtn = useRef(null);
  const dispatch = useDispatch();

  const onProfileBtnClick = () => {
    updatePopupUrlHash(PROFILE_POPUP, true, profileBtn.current.getBoundingClientRect());
  };

  const onAddBtnClick = () => {
    dispatch(updateNoteId(NEW_NOTE));
  };

  return (
    <div className="flex flex-col w-full min-w-56 h-full pt-5 pb-4 bg-gray-100">
      <div className="flex items-center flex-shrink-0 px-6">
        <img className="h-8 w-auto" src={logoFull} alt="Justnote" />
      </div>
      <div className="h-0 flex-1 flex flex-col">
        {/* User account dropdown */}
        <div className="hidden pl-3 pr-1 mt-6 relative inline-block text-left lg:block">
          <button ref={profileBtn} onClick={onProfileBtnClick} type="button" className="group w-full bg-gray-100 rounded-md px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-600" aria-haspopup="true" aria-expanded="true">
            <span className="flex w-full justify-between items-center">
              <span className="flex-1 flex min-w-0 items-center justify-between space-x-3">
                <img className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixqx=c2MT4LynBj&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80" alt="" />
                <span className="flex-1 min-w-0">
                  <span className="text-gray-900 text-sm font-medium truncate">Jessy Schwarz</span>
                </span>
              </span>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
        {/* Sidebar Search */}
        <SidebarSearchInput />
        {/* Add Button */}
        <div className="hidden pl-3 pr-1 mt-6 lg:block">
          <button onClick={onAddBtnClick} type="button" className="py-2 w-full bg-green-600 text-sm font-medium text-white border border-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-600">
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
        <SidebarListNames />
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
