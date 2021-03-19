import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import cache from '../utils/cache';
import { tailwind } from '../stylesheets/tailwind';

import logo from '../images/logo-short.svg';

const Loading = () => {
  return (
    <View style={tailwind('items-center w-full h-full')}>
      <View style={cache('LO_view', [{ transform: [{ translateY: -24 }] }, tailwind('top-1/3 w-12 h-12')])}>
        <SvgXml width={48} height={48} xml={logo} />
      </View>
    </View>
  );
};

export default React.memo(Loading);
