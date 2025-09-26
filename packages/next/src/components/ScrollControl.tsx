import React, { useLayoutEffect, useMemo } from 'react';

import { useSelector } from '../store';
import { debounce, isMobile as _isMobile, scrollWindowTopOrIntoView } from '../utils';

const ScrollControl = () => {

  const isSettingsPopupShown = useSelector(state => state.display.isSettingsPopupShown);
  const isMobile = useMemo(() => _isMobile(), []);

  useLayoutEffect(() => {
    // Need to set overflow hidden on the html element,
    //   so CKEditor image toolbar popup doesn't make the body scrollable.
    const html = window.document.documentElement;

    const originalOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    return () => {
      html.style.overflow = originalOverflow;
    };
  }, []);

  useLayoutEffect(() => {
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

  return null;
};

export default React.memo(ScrollControl);
