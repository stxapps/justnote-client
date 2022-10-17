import React from 'react';

import { LG_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import NoteListItemMenuPopup from './NoteListItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import SettingsErrorPopup from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import ConfirmExitDummyPopup from './ConfirmExitDummyPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const panel = safeAreaWidth < LG_WIDTH ? <NavPanel /> : <ColsPanel />;

  return (
    <React.Fragment>
      {panel}
      <SidebarProfilePopup />
      <NoteListMenuPopup />
      <NoteListItemMenuPopup />
      <PinMenuPopup />
      <PaywallPopup />
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <TimePickPopup />
      <PinErrorPopup />
      <SettingsErrorPopup />
      <ListNamesPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
      <ConfirmExitDummyPopup />
      <SignUpPopup />
      <SignInPopup />
      <PaywallPopup />
      <AccessErrorPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
