import React from 'react';
import { View } from 'react-native';

import { useSelector } from '../store';
import { BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { useTailwind } from '.';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

const Loading = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = useTailwind();

  return (
    <View style={tailwind('h-full w-full items-center bg-white blk:bg-gray-900')}>
      <View style={cache('LO_view', [{ transform: [{ translateY: -24 }] }, tailwind('top-1/3 h-12 w-12')])}>
        {themeMode === BLK_MODE ? <LogoBlk width={48} height={48} /> : <Logo width={48} height={48} />}
      </View>
    </View>
  );
};

export default React.memo(Loading);
