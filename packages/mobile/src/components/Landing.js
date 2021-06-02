import React from 'react';
import { useDispatch } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import { SM_WIDTH } from '../types/const';
import { signUp, signIn } from '../actions';
import { tailwind } from '../stylesheets/tailwind';
import cache from '../utils/cache';

import logoFull from '../images/logo-full.svg';

const Landing = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const dispatch = useDispatch();

  const onSignUpBtnClick = () => {
    dispatch(signUp());
  };

  const onSignInBtnClick = () => {
    dispatch(signIn());
  };

  return (
    <ScrollView contentContainerStyle={tailwind('min-h-full')}>
      <View style={tailwind('items-end justify-center p-4 md:p-6 lg:p-8', safeAreaWidth)}>
        <TouchableOpacity onPress={onSignInBtnClick} style={tailwind('bg-white rounded-md shadow px-4 py-2 border border-transparent items-center justify-center')}>
          <Text style={tailwind('text-base font-medium text-green-600')}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <View style={cache('L_middleView', [tailwind('max-w-lg self-center flex-1 items-start justify-center p-6 lg:p-8', safeAreaWidth), { minHeight: 256 }])}>
        <SvgXml width={135} height={40} xml={logoFull} />
        <Text style={tailwind('text-gray-500 text-xl font-normal pt-3')}>A note taking app that you can use it easily, take a note rapidly, and importantly, have full control of your own data.</Text>
      </View>
      <View style={tailwind('items-center justify-center p-6 lg:p-8', safeAreaWidth)}>
        <TouchableOpacity onPress={onSignUpBtnClick} style={tailwind(`flex-row items-center justify-center px-8 py-3 border border-transparent rounded-md shadow bg-green-600 ${safeAreaWidth < SM_WIDTH ? 'w-full' : ''}`)}>
          <Text style={tailwind('text-base font-medium text-white')}>Get started</Text>
          <Svg style={cache('L_signUpArrow', [tailwind('ml-2 text-white font-normal'), { marginTop: 2 }])} width={6} height={10} viewBox="0 0 6 10" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
          </Svg>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default React.memo(Landing);
