import React from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { LG_WIDTH } from '../types/const';

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
