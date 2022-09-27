import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';

import { BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import cache from '../utils/cache';

import { useTailwind } from '.';

import logo from '../images/logo-short.svg';
import logoBlk from '../images/logo-short-blk.svg';

const Loading = () => {
  const themeMode = useSelector(state => getThemeMode(state));
  const tailwind = useTailwind();

  return (
    <View style={tailwind('h-full w-full items-center bg-white blk:bg-gray-900')}>
      <View style={cache('LO_view', [{ transform: [{ translateY: -24 }] }, tailwind('top-1/3 h-12 w-12')])}>
        <SvgXml width={48} height={48} xml={themeMode === BLK_MODE ? logoBlk : logo} />
      </View>
    </View>
  );
};

export default React.memo(Loading);
