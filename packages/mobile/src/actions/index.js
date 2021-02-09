import { Linking, Dimensions, Platform } from 'react-native';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_POPUP,
  RESET_STATE,
} from '../types/actionTypes';
import {
  DOMAIN_NAME, APP_DOMAIN_NAME, BLOCKSTACK_AUTH,
} from '../types/const';
import {
  separateUrlAndParam, getUserImageUrl,
} from '../utils';

export const init = () => async (dispatch, getState) => {

  const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH
    };
    await userSession.createSession(config);
  }

  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    await handlePendingSignIn(initialUrl)(dispatch, getState);
  }

  Linking.addEventListener('url', async (e) => {
    await handlePendingSignIn(e.url)(dispatch, getState);
  });

  Dimensions.addEventListener("change", ({ window }) => {
    dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.width,
        windowHeight: window.height,
      }
    });
  });

  const isUserSignedIn = await userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }
  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
    }
  });
};

const handlePendingSignIn = (url) => async (dispatch, getState) => {

  if (!url.startsWith(DOMAIN_NAME + BLOCKSTACK_AUTH) &&
    !url.startsWith(APP_DOMAIN_NAME + BLOCKSTACK_AUTH)) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true
  });

  const { param: { authResponse } } = separateUrlAndParam(url, 'authResponse');
  try {
    await userSession.handlePendingSignIn(authResponse);
  } catch (e) {
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const isUserSignedIn = await userSession.isUserSignedIn();
  if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    dispatch({
      type: UPDATE_USER,
      payload: {
        isUserSignedIn: true,
        username: userData.username,
        image: getUserImageUrl(userData),
      }
    });
  }

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false
  });
};

export const signUp = () => async (dispatch, getState) => {
  // On Android, signUp and signIn will always lead to handlePendingSignIn.
  // On iOS, signUp and signIn will always return a promise.
  if (Platform.OS === 'android') {
    await userSession.signUp();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true
    });

    try {
      await userSession.signUp();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
      //   - Invalid token
      //   - Already signed in with the same account
      //   - Already signed in with different account
    }

    const isUserSignedIn = await userSession.isUserSignedIn();
    if (isUserSignedIn) {
      const userData = await userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
    });
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signIn = () => async (dispatch, getState) => {

  if (Platform.OS === 'android') {
    await userSession.signIn();
  } else if (Platform.OS === 'ios') {

    // As handle pending sign in takes time, show loading first.
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: true
    });

    try {
      await userSession.signIn();
    } catch (e) {
      // All errors thrown by signIn have the same next steps
      //   - Invalid token
      //   - Already signed in with the same account
      //   - Already signed in with different account
    }

    const isUserSignedIn = await userSession.isUserSignedIn();
    if (isUserSignedIn) {
      const userData = await userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        }
      });
    }

    // Stop show loading
    dispatch({
      type: UPDATE_HANDLING_SIGN_IN,
      payload: false
    });
  } else {
    throw new Error(`Invalid Platform.OS: ${Platform.OS}`);
  }
};

export const signOut = () => async (dispatch, getState) => {

  await userSession.signUserOut();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const updatePopup = (id, isShown) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown },
  };
};
