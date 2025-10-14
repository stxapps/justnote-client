import React, { useEffect, useRef } from 'react';

import { useDispatch } from '../store';
import { endIapConnection } from '../actions/iap';
import { LG_WIDTH } from '../types/const';
import { toPx } from '../utils';

import { useSafeAreaFrame } from '.';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import NoteListMenuPopup from './NoteListMenuPopup';
import NoteListItemMenuPopup from './NoteListItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import LockMenuPopup from './LockMenuPopup';
import TagEditorPopup from './TagEditorPopup';
import {
  ExportNoteAsPdfCompletePopup, ExportNoteAsPdfErrorPopup,
} from './ExportNoteAsPdfPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsTagsMenuPopup from './SettingsTagsMenuPopup';
import DateFormatMenuPopup from './DateFormatMenuPopup';
import TimePickPopup from './TimePickPopup';
import PinErrorPopup from './PinErrorPopup';
import TagErrorPopup from './TagErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import LockEditorPopup from './LockEditorPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import ConfirmExitDummyPopup from './ConfirmExitDummyPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';
import HubErrorPopup from './HubErrorPopup';

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

  const panel = safeAreaWidth < toPx(LG_WIDTH) ? <NavPanel /> : <ColsPanel />;

  return (
    <React.Fragment>
      {panel}
      <NoteListMenuPopup />
      <NoteListItemMenuPopup />
      <PinMenuPopup />
      <BulkEditMenuPopup />
      <LockMenuPopup />
      <TagEditorPopup />
      <ExportNoteAsPdfCompletePopup />
      <ExportNoteAsPdfErrorPopup />
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <SettingsTagsMenuPopup />
      <DateFormatMenuPopup />
      <TimePickPopup />
      <PinErrorPopup />
      <TagErrorPopup />
      <SettingsConflictErrorPopup />
      <SettingsUpdateErrorPopup />
      <ListNamesPopup />
      <LockEditorPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
      <ConfirmExitDummyPopup />
      <SignUpPopup />
      <SignInPopup />
      <PaywallPopup />
      <AccessErrorPopup />
      <HubErrorPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
