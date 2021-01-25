import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { NativeModules } from 'react-native';

import { init } from '../actions';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const App = React.memo(() => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (isUserSignedIn === null) return <Loading />;

  if (isUserSignedIn === true) return <Main />;

  return <Landing />;
});

export default App;
