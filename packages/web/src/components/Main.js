import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { endIapConnection } from '../actions';
import { LG_WIDTH } from '../types/const';
import { debounce, isMobile as _isMobile, scrollWindowTopOrIntoView } from '../utils';

import { useSafeAreaFrame } from '.';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';
import SidebarProfilePopup from './SidebarProfilePopup';
import NoteListMenuPopup from './NoteListMenuPopup';
import NoteListItemMenuPopup from './NoteListItemMenuPopup';
import PinMenuPopup from './PinMenuPopup';
import SettingsPopup from './SettingsPopup';
import SettingsListsMenuPopup from './SettingsListsMenuPopup';
import DateFormatMenuPopup from './DateFormatMenuPopup';
import PinErrorPopup from './PinErrorPopup';
import {
  SettingsUpdateErrorPopup, SettingsConflictErrorPopup,
} from './SettingsErrorPopup';
import ListNamesPopup from './ListNamesPopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ConfirmDiscardPopup from './ConfirmDiscardPopup';
import PaywallPopup from './PaywallPopup';
import AccessErrorPopup from './AccessErrorPopup';
import StaleErrorPopup from './StaleErrorPopup';

const Main = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const isSettingsPopupShown = useSelector(state => state.display.isSettingsPopupShown);
  const isMobile = useMemo(() => _isMobile(), []);
  const dispatch = useDispatch();

  // To make sure useEffect is componentWillUnmount
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    // Need to add class name: overflow-hidden to <body>
    //   so that CKEditor image toolbar popup doesn't make the body scrollable
    const body = document.body || document.getElementsByTagName('body')[0];
    body.classList.add('overflow-hidden');

    return () => {
      body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    // When soft keyboard appears, layout viewport will be scrollable
    //   and it might be scrolled to make the focused input visible,
    //   but only work for SettingsLists, doesn't work for SearchInput and NoteEditor
    //   (as need to scroll at the panel/view level, not layout viewport level)
    //   so need to monitor and try to scroll back.
    if (!window.visualViewport || isSettingsPopupShown || !isMobile) return;

    const scrollListener = debounce(() => scrollWindowTopOrIntoView(), 100);
    window.visualViewport.addEventListener('scroll', scrollListener);

    return () => {
      if (!window.visualViewport || isSettingsPopupShown || !isMobile) return;
      window.visualViewport.removeEventListener('scroll', scrollListener);
    };
  }, [isSettingsPopupShown, isMobile]);

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
      <SettingsPopup />
      <SettingsListsMenuPopup />
      <DateFormatMenuPopup />
      <PinErrorPopup />
      <SettingsConflictErrorPopup />
      <SettingsUpdateErrorPopup />
      <ListNamesPopup />
      <ConfirmDeletePopup />
      <ConfirmDiscardPopup />
      <PaywallPopup />
      <AccessErrorPopup />
      <StaleErrorPopup />
    </React.Fragment>
  );
};

export default React.memo(Main);
