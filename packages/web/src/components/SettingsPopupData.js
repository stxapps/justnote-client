import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  importAllData, updateImportAllDataProgress, exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress,
} from '../actions/data';
import { HASH_SUPPORT, SM_WIDTH } from '../types/const';

import { useSafeAreaFrame, useTailwind } from '.';

const _SettingsPopupData = (props) => {

  const {
    onSidebarOpenBtnClick, onToImportAllDataViewBtnClick,
    onToExportAllDataViewBtnClick, onToDeleteAllDataViewBtnClick,
  } = props;
  const tailwind = useTailwind();

  return (
    <div className={tailwind('p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Data</h3>
      </div>
      <div className={tailwind('mt-6 md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Data Server</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Justnote stores your data in a Stacks data server. You can specify which Stacks data server to store your data. By default, your Stacks data server is at <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://hub.blockstack.org/hub_info" target="_blank" rel="noreferrer">hub.blockstack.org</a> provided by <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://www.hiro.so" target="_blank" rel="noreferrer">Hiro Systems</a>. You can also deploy your own Stacks data server. To change your Stacks data server, you need to record your server’s information on the Stacks blockchain. Justnote stores your data on the server specified in the blockchain. For more details, please visit <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://docs.stacks.co/docs/gaia" target="_blank" rel="noreferrer">Stacks Gaia</a>.</p>
      </div>
      <div className={tailwind('mt-8')}>
        <button onClick={onToImportAllDataViewBtnClick} className={tailwind('w-full rounded-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-400 blk:focus:ring-gray-500')}>
          <h4 className={tailwind('text-base font-medium text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Import Data</h4>
        </button>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Import data from a zip file. The zip file can be exported from some note taking apps i.e. <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://takeout.google.com/" target="_blank" rel="noreferrer">Google Keep</a>, <a className={tailwind('rounded underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href="https://help.evernote.com/hc/en-us/articles/209005557-Export-notes-and-notebooks-as-ENEX-or-HTML" target="_blank" rel="noreferrer">Evernote</a> (as multiple web pages (.html) and manually zip the folder), and our website.</p>
      </div>
      <div className={tailwind('mt-8')}>
        <button onClick={onToExportAllDataViewBtnClick} className={tailwind('w-full rounded-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-400 blk:focus:ring-gray-500')}>
          <h4 className={tailwind('text-base font-medium text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Export All Data</h4>
        </button>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a zip file.</p>
      </div>
      <div className={tailwind('mt-8 mb-4')}>
        <button onClick={onToDeleteAllDataViewBtnClick} className={tailwind('w-full rounded-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-400 blk:focus:ring-gray-500')}>
          <h4 className={tailwind('text-base font-medium text-gray-800 underline hover:text-gray-900 blk:text-gray-100 blk:hover:text-white')}>Delete All Data</h4>
        </button>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</p>
      </div>
    </div>
  );
};

const _SettingsPopupDataImport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const importAllDataProgress = useSelector(
    state => state.display.importAllDataProgress
  );
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onImportAllDataBtnClick = () => {
    dispatch(importAllData());
  };

  useEffect(() => {
    return () => {
      if (importAllDataProgress) {
        const { total, done } = importAllDataProgress;
        if (total === done) dispatch(updateImportAllDataProgress(null));
      }
    };
  }, [importAllDataProgress, dispatch]);

  let actionPanel;
  if (!importAllDataProgress) {
    actionPanel = (
      <button onClick={onImportAllDataBtnClick} type="button" className={tailwind('mt-6 mb-4 block rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200 blk:focus:border-gray-300 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>
        Choose a file
      </button>
    );
  } else if (importAllDataProgress.total === -1) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
        </div>
        <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{importAllDataProgress.error}</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
      </div>
    );
  } else if (importAllDataProgress.total === 0) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to import.</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else if (importAllDataProgress.total === importAllDataProgress.done) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  } else {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
          <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Importing...</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</p>
      </div>
    );
  }

  return (
    <div className={tailwind('p-4 md:p-6 md:pt-4')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <button onClick={onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Import Data</h3>
      </div>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Import data from a zip file.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to import data.</p>
      {actionPanel}
    </div>
  );
};

const _SettingsPopupDataExport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const exportAllDataProgress = useSelector(
    state => state.display.exportAllDataProgress
  );
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onExportAllDataBtnClick = () => {
    if (didClick.current) return;
    dispatch(exportAllData());
    didClick.current = true;
  };

  useEffect(() => {
    return () => {
      if (exportAllDataProgress) {
        const { total, done } = exportAllDataProgress;
        if (total === done) dispatch(updateExportAllDataProgress(null));
      }
    };
  }, [exportAllDataProgress, dispatch]);

  let actionPanel;
  if (!exportAllDataProgress) {
    actionPanel = (
      <button onClick={onExportAllDataBtnClick} type="button" className={tailwind('mt-6 mb-4 block rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200 blk:focus:border-gray-300 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>
        Export All My Data
      </button>
    );
  } else if (exportAllDataProgress.total === -1) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
        </div>
        <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{exportAllDataProgress.error}</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
      </div>
    );
  } else if (exportAllDataProgress.total === 0) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to export.</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
      </div>
    );
  } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
      </div>
    );
  } else {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
          <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Exporting...</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</p>
      </div>
    );
  }

  return (
    <div className={tailwind('p-4 md:p-6 md:pt-4')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <button onClick={onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Export All Data</h3>
      </div>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a zip file.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to export all your data.</p>
      {actionPanel}
    </div>
  );
};

const _SettingsPopupDataDelete = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const deleteAllDataProgress = useSelector(state => state.display.deleteAllDataProgress);
  const [didCheckConfirm, setDidCheckConfirm] = useState(false);
  const [isRequiredConfirmShown, setIsRequiredConfirmShown] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onConfirmInputChange = (e) => {
    setDidCheckConfirm(e.target.checked);
    setIsRequiredConfirmShown(false);
  };

  const onDeleteAllDataBtnClick = () => {
    if (didClick.current) return;

    if (didCheckConfirm) {
      if (isRequiredConfirmShown) setIsRequiredConfirmShown(false);
      dispatch(deleteAllData());
      didClick.current = true;
      return;
    }

    setIsRequiredConfirmShown(true);
  };

  useEffect(() => {
    return () => {
      if (deleteAllDataProgress) {
        const { total, done } = deleteAllDataProgress;
        if (total === done) dispatch(updateDeleteAllDataProgress(null));
      }
    };
  }, [deleteAllDataProgress, dispatch]);

  let actionPanel;
  if (!deleteAllDataProgress) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <button onClick={onDeleteAllDataBtnClick} type="button" className={tailwind('block rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-400 blk:bg-gray-900 blk:text-gray-300 blk:hover:border-gray-300 blk:hover:text-gray-200 blk:focus:border-gray-300 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>
          Delete All My Data
        </button>
        {isRequiredConfirmShown && <p className={tailwind('mt-2 text-base text-red-600 blk:text-red-500')}>Please confirm by checking the box above first.</p>}
      </div>
    );
  } else if (deleteAllDataProgress.total === -1) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-red-500 blk:text-red-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-red-600 blk:text-red-500')}>Oops..., something went wrong!</p>
        </div>
        <p className={tailwind('text-base leading-relaxed text-red-600 blk:text-red-500')}>{deleteAllDataProgress.error}</p>
        <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 blk:hover:text-gray-200 blk:focus:ring-gray-500')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
      </div>
    );
  } else if (deleteAllDataProgress.total === 0) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-gray-400 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>No data to delete.</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
      </div>
    );
  } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <svg className={tailwind('w-5 flex-shrink-0 flex-grow-0 text-green-500 blk:text-green-400')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </svg>
          <p className={tailwind('ml-1 flex-shrink flex-grow text-base text-gray-500 blk:text-gray-400')}>Done</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
      </div>
    );
  } else {
    actionPanel = (
      <div className={tailwind('mt-6 mb-4')}>
        <div className={tailwind('flex items-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
          <p className={tailwind('ml-1 text-base text-gray-500 blk:text-gray-400')}>Deleting...</p>
        </div>
        <p className={tailwind('text-base text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</p>
      </div>
    );
  }

  return (
    <div className={tailwind('p-4 md:p-6 md:pt-4')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <button onClick={onBackToDataViewBtnClick} className={tailwind('group pb-1 focus:outline-none md:pb-0')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>{safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100 md:pb-0')}>Delete All Data</h3>
      </div>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>This will only remove all your data, not your account. You will still be able to sign in.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>It may take several minutes to delete all your data.</p>
      <p className={tailwind('mt-6 text-base leading-relaxed text-red-600 blk:text-red-500')}>This action CANNOT be undone.</p>
      <div className={tailwind('mt-6 flex items-center')}>
        <input onChange={onConfirmInputChange} checked={didCheckConfirm} className={tailwind('h-4 w-4 cursor-pointer rounded border-gray-400 bg-white text-gray-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-400 blk:bg-gray-900 blk:text-green-500 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')} id="confirm-input" name="confirm-input" type="checkbox" />
        <label htmlFor="confirm-input" className={tailwind('ml-2 block cursor-pointer text-base text-gray-500 blk:text-gray-400')}>Yes, I’m absolutely sure I want to delete all my data.</label>
      </div>
      {actionPanel}
    </div>
  );
};

export const SettingsPopupData = React.memo(_SettingsPopupData);
export const SettingsPopupDataImport = React.memo(_SettingsPopupDataImport);
export const SettingsPopupDataExport = React.memo(_SettingsPopupDataExport);
export const SettingsPopupDataDelete = React.memo(_SettingsPopupDataDelete);
