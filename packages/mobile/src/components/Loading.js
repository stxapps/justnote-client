import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import cache from '../utils/cache';

import { useTailwind } from '.';
import logo from '../images/logo-short.svg';

const Loading = () => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('h-full w-full items-center')}>
      <View style={cache('LO_view', [{ transform: [{ translateY: -24 }] }, tailwind('top-1/3 h-12 w-12')])}>
        <SvgXml width={48} height={48} xml={logo} />
      </View>
    </View>
  );
};

export default React.memo(Loading);
