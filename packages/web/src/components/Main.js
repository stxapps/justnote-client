import React, { useEffect } from 'react';

import { LG_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsErrorPopup from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import AlertScreenRotationPopup from './AlertScreenRotationPopup';

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();

  useEffect(() => {
    // Need to add class name: overflow-hidden to <body>
    //   so that CKEditor image toolbar popup doesn't make the body scrollable
    const body = document.body || document.getElementsByTagName('body')[0];
    body.classList.add('overflow-hidden');

    return () => {
      body.classList.remove('overflow-hidden');
    };
  }, []);

  const panel = safeAreaWidth < LG_WIDTH ? <NavPanel /> : <ColsPanel />;

  return (
    <React.Fragment>
      {panel}
      <SidebarProfilePopup />
      <NoteListMenuPopup />
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <SettingsErrorPopup />
      <ListNamesPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
      <AlertScreenRotationPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
