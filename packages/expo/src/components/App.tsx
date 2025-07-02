import React from 'react';

import { useSelector } from '../store';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';

const App = () => {
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isUserDummy = useSelector(state => state.user.isUserDummy);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);

  if (isUserSignedIn === null || isHandlingSignIn) return <Loading />;
  if (isUserSignedIn === true || isUserDummy === true) return <Main />;

  return <Landing />;
};

export default React.memo(App);
