import React, { useEffect, useRef } from 'react';

import { useDispatch } from '../store';
import { endIapConnection } from '../actions/iap';
import { LG_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';
import ScrollControl from './ScrollControl';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import NoteListItemMenuPopup from './NoteListItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import BulkEditMenuPopup from './BulkEditMenuPopup';
import LockMenuPopup from './LockMenuPopup';
import TagEditorPopup from './TagEditorPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import SettingsTagsMenuPopup from './SettingsTagsMenuPopup';
import DateFormatMenuPopup from './DateFormatMenuPopup';
import PinErrorPopup from './PinErrorPopup';
import TagErrorPopup from './TagErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import LockEditorPopup from './LockEditorPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';
import StaleErrorPopup from './StaleErrorPopup';
import UseSyncErrorPopup from './UseSyncErrorPopup';
import HubErrorPopup from './HubErrorPopup';
import SWWUPopup from './SWWUPopup';

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
      <ScrollControl />
      {panel}
      <SidebarProfilePopup />
      <NoteListMenuPopup />
      <NoteListItemMenuPopup />
      <PinMenuPopup />
      <BulkEditMenuPopup />
      <LockMenuPopup />
      <TagEditorPopup />
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <SettingsTagsMenuPopup />
      <DateFormatMenuPopup />
      <PinErrorPopup />
      <TagErrorPopup />
      <SettingsConflictErrorPopup />
      <SettingsUpdateErrorPopup />
      <ListNamesPopup />
      <LockEditorPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
      <PaywallPopup />
      <AccessErrorPopup />
      <StaleErrorPopup />
      <UseSyncErrorPopup />
      <HubErrorPopup />
      <SWWUPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
