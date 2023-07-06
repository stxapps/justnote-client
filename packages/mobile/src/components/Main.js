import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { endIapConnection } from '../actions';
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
import {
  ExportNoteAsPdfCompletePopup, ExportNoteAsPdfErrorPopup,
} from './ExportNoteAsPdfPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import DateFormatMenuPopup from './DateFormatMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import ConfirmExitDummyPopup from './ConfirmExitDummyPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const dispatch = useDispatch();

  // To make sure useEffect is componentWillUnmount
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatchRef.current(endIapConnection());
    };
  }, []);

  const panel = safeAreaWidth < LG_WIDTH ? <NavPanel /> : <ColsPanel />;

  return (
    <React.Fragment>
      {panel}
      <SidebarProfilePopup />
      <NoteListMenuPopup />
      <NoteListItemMenuPopup />
      <PinMenuPopup />
      <ExportNoteAsPdfCompletePopup />
      <ExportNoteAsPdfErrorPopup />
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <DateFormatMenuPopup />
      <TimePickPopup />
      <PinErrorPopup />
      <SettingsConflictErrorPopup />
      <SettingsUpdateErrorPopup />
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
