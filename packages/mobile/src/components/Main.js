import React from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { LG_WIDTH } from '../types/const';

import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import MoveToPopup from './MoveToPopup';
import SettingsPopup from './SettingsPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const panel = safeAreaWidth < LG_WIDTH ? <NavPanel /> : <ColsPanel />;

  return (
    <React.Fragment>
      {panel}
      <SidebarProfilePopup />
      <NoteListMenuPopup />
      <MoveToPopup />
      <SettingsPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
