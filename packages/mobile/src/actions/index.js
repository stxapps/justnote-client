import { Linking, Dimensions } from 'react-native';

import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME,
} from '../types/const';

export const init = () => async (dispatch, getState) => {

  /*const hasSession = await userSession.hasSession();
  if (!hasSession) {
    const config = {
      appDomain: DOMAIN_NAME,
      scopes: ['store_write'],
      redirectUrl: BLOCKSTACK_AUTH
    };
    await userSession.createSession(config);
  }*/

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

  //const isUserSignedIn = await userSession.isUserSignedIn();
  const isUserSignedIn = false;
  let username = null, userImage = null;
  /*if (isUserSignedIn) {
    const userData = await userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }*/
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

};

export const signUp = () => async (dispatch, getState) => {

};

export const signIn = () => async (dispatch, getState) => {

};
