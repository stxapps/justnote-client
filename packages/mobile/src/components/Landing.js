import React from 'react';
import { useDispatch } from 'react-redux';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';

import { updatePopup } from '../actions';
import {
  SIGN_UP_POPUP, SIGN_IN_POPUP, CONFIRM_AS_DUMMY_POPUP, SM_WIDTH,
} from '../types/const';
import cache from '../utils/cache';

import { useSafeAreaFrame, useTailwind } from '.';
import SignUpPopup from './SignUpPopup';
import SignInPopup from './SignInPopup';
import ConfirmAsDummyPopup from './ConfirmAsDummyPopup';

import logoFull from '../images/logo-full.svg';

const Landing = () => {

  const { width: safeAreaWidth } = useSafeAreaFrame();
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSignUpBtnClick = () => {
    dispatch(updatePopup(SIGN_UP_POPUP, true));
  };

  const onSignInBtnClick = () => {
    dispatch(updatePopup(SIGN_IN_POPUP, true));
  };

  const onAsDummyBtnClick = () => {
    dispatch(updatePopup(CONFIRM_AS_DUMMY_POPUP, true));
  };

  return (
    <React.Fragment>
      <ScrollView contentContainerStyle={tailwind('min-h-full')}>
        <View style={tailwind('items-end justify-center p-4 md:p-6 lg:p-8')}>
          <TouchableOpacity onPress={onSignInBtnClick} style={tailwind('items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 shadow')}>
            <Text style={tailwind('text-base font-medium text-green-600')}>Sign in</Text>
          </TouchableOpacity>
        </View>
        <View style={cache('L_middleView', [tailwind('max-w-lg flex-1 items-start justify-center self-center p-6 lg:p-8'), { minHeight: 256 }])}>
          <SvgXml width={135} height={40} xml={logoFull} />
          <Text style={tailwind('pt-3 text-xl font-normal text-gray-500')}>A note taking app that you can use easily, take a note rapidly, and importantly, have full control of your data.</Text>
        </View>
        <View style={tailwind('items-center justify-center p-6 lg:p-8')}>
          <TouchableOpacity onPress={onSignUpBtnClick} style={tailwind(`flex-row items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 shadow md:py-4 md:px-10 ${safeAreaWidth < SM_WIDTH ? 'w-full' : ''}`)}>
            <Text style={tailwind('text-base font-medium text-white md:text-lg')}>Get started</Text>
            <Svg style={cache('L_signUpArrow', [tailwind('ml-2 font-normal text-white'), { marginTop: 2 }])} width={6} height={10} viewBox="0 0 6 10" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M0.29289 9.7071C-0.09763 9.3166 -0.09763 8.6834 0.29289 8.2929L3.5858 5L0.29289 1.70711C-0.09763 1.31658 -0.09763 0.68342 0.29289 0.29289C0.68342 -0.09763 1.31658 -0.09763 1.70711 0.29289L5.7071 4.29289C6.0976 4.68342 6.0976 5.3166 5.7071 5.7071L1.70711 9.7071C1.31658 10.0976 0.68342 10.0976 0.29289 9.7071Z" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAsDummyBtnClick} style={tailwind(`items-center justify-center border border-transparent bg-transparent px-8 py-3 md:py-4 md:px-10 ${safeAreaWidth < SM_WIDTH ? 'w-full' : ''}`)}>
            <Text style={tailwind('text-base font-normal text-gray-500 md:text-lg')}>Continue without an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SignUpPopup />
      <SignInPopup />
      <ConfirmAsDummyPopup />
    </React.Fragment>
  );
};

export default React.memo(Landing);
