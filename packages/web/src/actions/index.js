import { showConnect, authenticate } from '@stacks/connect';
import Url from 'url-parse';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_POPUP, RESET_STATE,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME,
} from '../types/const';
import {
  throttle, getUserImageUrl,
  extractUrl, separateUrlAndParam, getUrlPathQueryHash, urlHashToObj, objToUrlHash,
} from '../utils';

export const init = () => async (dispatch, getState) => {

  await handlePendingSignIn()(dispatch, getState);

  const isUserSignedIn = userSession.isUserSignedIn();
  let username = null, userImage = null;
  if (isUserSignedIn) {
    const userData = userSession.loadUserData();
    username = userData.username;
    userImage = getUserImageUrl(userData);
  }

  handleUrlHash();

  dispatch({
    type: INIT,
    payload: {
      isUserSignedIn,
      username,
      userImage,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    }
  });

  // Let hash get updated first before add an listener
  setTimeout(() => {
    window.addEventListener('hashchange', function (e) {
      onUrlHashChange(e.oldURL, e.newURL, dispatch, getState);
    });
  }, 1);

  window.addEventListener('resize', throttle(() => {
    dispatch({
      type: UPDATE_WINDOW_SIZE,
      payload: {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }
    });
  }, 16));
};

const handlePendingSignIn = () => async (dispatch, getState) => {

  const { pathname } = extractUrl(window.location.href);
  if (!(pathname === '/' && userSession.isSignInPending())) return;

  // As handle pending sign in takes time, show loading first.
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: true
  });

  try {
    await userSession.handlePendingSignIn();
  } catch (e) {
    console.log(`Catched an error thrown by handlePendingSignIn: ${e.message}`);
    // All errors thrown by handlePendingSignIn have the same next steps
    //   - Invalid token
    //   - Already signed in with the same account
    //   - Already signed in with different account
  }

  const { separatedUrl } = separateUrlAndParam(window.location.href, 'authResponse');
  window.history.replaceState(window.history.state, '', separatedUrl);

  // Stop show loading
  dispatch({
    type: UPDATE_HANDLING_SIGN_IN,
    payload: false
  });
};

export const signUp = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    onFinish: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        },
      });
    },
    sendToSignIn: false,
    userSession: /** @type any */(userSession),
  };

  showConnect(authOptions);
};

export const signIn = () => async (dispatch, getState) => {

  const authOptions = {
    redirectTo: '/' + getUrlPathQueryHash(window.location.href),
    appDetails: {
      name: APP_NAME,
      icon: extractUrl(window.location.href).origin + '/' + APP_ICON_NAME,
    },
    finished: ({ userSession }) => {

      const userData = userSession.loadUserData();
      dispatch({
        type: UPDATE_USER,
        payload: {
          isUserSignedIn: true,
          username: userData.username,
          image: getUserImageUrl(userData),
        },
      });
    },
    sendToSignIn: true,
    userSession: /** @type any */(userSession),
  };

  authenticate(authOptions);
};

export const signOut = () => async (dispatch, getState) => {

  userSession.signUserOut();

  // clear all user data!
  dispatch({
    type: RESET_STATE,
  });
};

export const handleUrlHash = () => {
  const urlObj = new Url(window.location.href, {});
  if (urlObj.hash !== '') {
    urlObj.set('hash', '');
    window.location.replace(urlObj.toString());
  }
};

export const onUrlHashChange = (oldUrl, newUrl, dispatch, getState) => {
  console.log(`onUrlHashChange called with oldUrl: ${oldUrl} and newUrl: ${newUrl}.`);

  const oldUrlObj = new Url(oldUrl, {});
  const oldHashObj = urlHashToObj(oldUrlObj.hash);

  const newUrlObj = new Url(newUrl, {});
  const newHashObj = urlHashToObj(newUrlObj.hash);

  console.log(`oldHashObj: `, oldHashObj);
  console.log(`newHashObj: `, newHashObj);

  if ('p' in oldHashObj && 'p' in newHashObj) {
    // something else changed
    if (oldHashObj['p'] === newHashObj['p']) {

    } else {

    }
  } else if ('p' in oldHashObj && !('p' in newHashObj)) {
    // Close popup
    dispatch(updatePopup(oldHashObj['p'], false, null));
  } else if (!('p' in oldHashObj) && 'p' in newHashObj) {
    // Open popup
    dispatch(updatePopup(newHashObj['p'], true, {
      top: parseInt(newHashObj['ppt']),
      right: parseInt(newHashObj['ppr']),
      bottom: parseInt(newHashObj['ppb']),
      left: parseInt(newHashObj['ppl']),
      width: parseInt(newHashObj['ppw']),
      height: parseInt(newHashObj['pph']),
    }));
  }
};

export const updateUrlHash = (q) => {
  const hashObj = { ...urlHashToObj(window.location.hash), ...q };
  const updatedHash = objToUrlHash(hashObj);
  window.location.hash = updatedHash;
};

export const updatePopupUrlHash = (id, isShown, anchorPosition) => {
  const obj = {};
  obj.p = isShown ? id : null;
  obj.ppt = isShown ? Math.round(anchorPosition.top) : null;
  obj.ppr = isShown ? Math.round(anchorPosition.right) : null;
  obj.ppb = isShown ? Math.round(anchorPosition.bottom) : null;
  obj.ppl = isShown ? Math.round(anchorPosition.left) : null;
  obj.ppw = isShown ? Math.round(anchorPosition.width) : null;
  obj.pph = isShown ? Math.round(anchorPosition.height) : null;

  updateUrlHash(obj);
};

export const updatePopup = (id, isShown, anchorPosition) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};
