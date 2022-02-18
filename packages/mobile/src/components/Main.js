import React from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { LG_WIDTH } from '../types/const';

import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';
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
import ConfirmExitDummyPopup from './ConfirmExitDummyPopup';

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
      <ConfirmExitDummyPopup />
      <SignUpPopup />
      <SignInPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
