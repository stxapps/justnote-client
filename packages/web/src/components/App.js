import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import { init } from '../actions';
import { extractUrl } from '../utils';

import Loading from './Loading';
import Landing from './Landing';
import Main from './Main';
import About from './About';
import Terms from './Terms';
import Privacy from './Privacy';
import Support from './Support';

const App = React.memo(() => {

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isHandlingSignIn = useSelector(state => state.display.isHandlingSignIn);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (isUserSignedIn === null || isHandlingSignIn) return <Loading />;

  const { pathname } = extractUrl(window.location.href);
  if (pathname === '/about') return <About />;
  if (pathname === '/terms') return <Terms />;
  if (pathname === '/privacy') return <Privacy />;
  if (pathname === '/support') return <Support />;

  if (isUserSignedIn === true) return <Main />;

  return <Landing />;
});

export default App;
