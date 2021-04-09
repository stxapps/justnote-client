import React, { useEffect } from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { registerCoreBlocks } from '@wordpress/block-library';

import { LG_WIDTH } from '../types/const';

import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import MoveToPopup from './MoveToPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import SettingsPopup from './SettingsPopup';

let didRegisterCoreBlocks = false;

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const panel = safeAreaWidth < LG_WIDTH ? <NavPanel /> : <ColsPanel />;

  useEffect(() => {
    if (!didRegisterCoreBlocks) {
      registerCoreBlocks();
      didRegisterCoreBlocks = true;
    }
  }, []);

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
