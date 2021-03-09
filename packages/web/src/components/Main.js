import React from 'react';

import { LG_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import MoveToPopup from './MoveToPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import SettingsPopup from './SettingsPopup';

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
    </React.Fragment>
  );
};

export default React.memo(Main);
