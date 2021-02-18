import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion"

import { updatePopupUrlHash } from '../actions';
import { SETTINGS_POPUP, MD_WIDTH } from '../types/const';
import { popupBgFMV, popupFMV } from '../types/animConfigs';

import { useSafeAreaFrame } from '.';

const VIEW_ACCOUNT = 1;
const VIEW_DATA = 2;
const VIEW_DATA_EXPORT = 3;
const VIEW_DATA_DELETE = 4;
const VIEW_LISTS = 5;
const VIEW_MISC = 6;

const SettingsPanel = () => {

  const { width: safeAreaWidth, height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSettingsPopupShown);
  const [isSidebarShown, setIsSidebarShown] = useState(safeAreaWidth < MD_WIDTH);
  const [viewId, setViewId] = useState(VIEW_ACCOUNT);
  const panelContent = useRef(null);
  const cancelBtn = useRef(null);

  /*const isViewSelected = (refViewId) => {
    const dataViews = [VIEW_DATA, VIEW_DATA_EXPORT, VIEW_DATA_DELETE];
    if (refViewId === VIEW_DATA) {
      return dataViews.includes(viewId);
    }

    return refViewId === viewId;
  }*/

  const onPopupCloseBtnClick = () => {
    updatePopupUrlHash(SETTINGS_POPUP, false, null);
  }

  /*const onSidebarOpenBtnClick = () => {
    setIsSidebarShown(true);
  }

  const onSidebarCloseBtnClick = () => {
    setIsSidebarShown(false);
  }

  const onAccountBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_ACCOUNT);
  }

  const onDataBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_DATA);
  }

  const onListsBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_LISTS);
  }

  const onMiscBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_MISC);
  }

  const onToExportAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_EXPORT);
  }

  const onToDeleteAllDataViewBtnClick = () => {
    setViewId(VIEW_DATA_DELETE);
  }

  const onBackToDataViewBtnClick = () => {
    setIsSidebarShown(false);
    setViewId(VIEW_DATA);
  }*/

  useEffect(() => {
    if (isShown) cancelBtn.current.focus();
  }, [isShown]);

  useEffect(() => {
    if (panelContent.current) panelContent.current.scroll(0, 0);
  }, [viewId]);

  useMemo(() => {
    if (isSidebarShown) {
      if (isSidebarShown) setIsSidebarShown(false);
      if (viewId !== VIEW_ACCOUNT) setViewId(VIEW_ACCOUNT);
    }
  }, [isSidebarShown, viewId]);

  if (!isShown) return (
    <AnimatePresence key="AP_SP"></AnimatePresence>
  );

  const _render = (content) => {

    const panelHeight = safeAreaHeight * 0.9;

    const panelWithSidebar = (
      <div key="panel-with-sidebar" className="relative flex flex-col overflow-hidden bg-white rounded-lg" style={{ height: panelHeight }}>
        <div className="hidden absolute top-0 right-0 p-1 md:block">
          <button onClick={onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:shadow-outline" aria-label="Close settings popup">
            <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="hidden border-b border-gray-400 md:block md:mt-6 md:ml-6 md:mr-6 lg:mt-8 lg:ml-8 lg:mr-8">
          <h2 className="pb-3 text-3xl text-gray-800 font-semibold leading-none">Settings</h2>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for desktop */}
          <div className="hidden md:flex md:flex-shrink-0 md:flex-grow-0">
            <div className="flex flex-col w-48">
            </div>
          </div>
          {/* Main panel */}
          <div className="flex flex-col flex-shrink flex-grow overflow-hidden">
            <div ref={panelContent} className="flex-1 relative overflow-y-auto focus:outline-none">
              {content}
              <div className="absolute top-0 right-0 p-1 md:hidden">
                <button onClick={onPopupCloseBtnClick} className="flex items-center justify-center h-7 w-7 rounded-full group focus:outline-none focus:shadow-outline" aria-label="Close settings popup">
                  <svg className="h-5 w-5 text-gray-500 group-hover:text-gray-700" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Sidebar for mobile */}

        </div>
      </div>
    );

    return (
      <AnimatePresence key="AP_SP">
        <div className="fixed inset-0 overflow-hidden">
          <div className="p-4 flex items-center justify-center" style={{ minHeight: safeAreaHeight }}>
            <div className={'fixed inset-0'}>
              <motion.button ref={cancelBtn} onClick={onPopupCloseBtnClick} className="absolute inset-0 w-full h-full bg-black opacity-25 cursor-default focus:outline-none" variants={popupBgFMV} initial="hidden" animate="visible" exit="hidden"></motion.button>
            </div>
            <motion.div className={'w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-xl'} variants={popupFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              {panelWithSidebar}
            </motion.div>
          </div>
        </div >
      </AnimatePresence>
    );
  };

  const renderAccountView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  const renderDataView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  const renderExportAllDataView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  const renderDeleteAllDataView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  const renderListsView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  const renderMiscView = () => {
    const content = (
      <div></div>
    );
    return _render(content);
  };

  if (viewId === VIEW_ACCOUNT) return renderAccountView();
  else if (viewId === VIEW_DATA) return renderDataView();
  else if (viewId === VIEW_DATA_EXPORT) return renderExportAllDataView();
  else if (viewId === VIEW_DATA_DELETE) return renderDeleteAllDataView();
  else if (viewId === VIEW_LISTS) return renderListsView();
  else if (viewId === VIEW_MISC) return renderMiscView();
  else throw new Error(`Invalid viewId: ${viewId}`);
};

export default React.memo(SettingsPanel);
