import React from 'react';

import { LG_WIDTH } from '../types/const';

import { useSafeAreaFrame } from '.';
import ColsPanel from './ColsPanel';
import NavPanel from './NavPanel';

const Main = React.memo(() => {

  const { width: safeAreaWidth } = useSafeAreaFrame();

  if (safeAreaWidth < LG_WIDTH) {
    return <NavPanel />;
  } else {
    return <ColsPanel />;
  }
});

export default Main;
