import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NativeModules, Keyboard } from 'react-native';

import { init } from '../actions';
import vars from '../vars';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const App = () => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isUserDummy = useSelector(state => state.user.isUserDummy);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', (e) => {
      vars.keyboard.height = e.endCoordinates.height;
    });
    keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', () => {
      vars.keyboard.height = 0;
    });

    return () => {
      keyboardDidShowListener.current.remove();
      keyboardDidHideListener.current.remove();
    };
  }, []);

  if (isUserSignedIn === null || isHandlingSignIn) return <Loading />;
  if (isUserSignedIn === true || isUserDummy === true) return <Main />;

  return <Landing />;
};

export default React.memo(App);
