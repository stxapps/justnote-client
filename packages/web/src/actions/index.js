import { showConnect, authenticate } from '@stacks/connect';
import Url from 'url-parse';

import userSession from '../userSession';
import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER, UPDATE_HANDLING_SIGN_IN,
  UPDATE_LIST_NAME, UPDATE_NOTE_ID, UPDATE_POPUP, UPDATE_SEARCH_STRING,
  UPDATE_BULK_EDITING,
  ADD_SELECTED_NOTE_IDS, DELETE_SELECTED_NOTE_IDS, CLEAR_SELECTED_NOTE_IDS,
  RESET_STATE,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME, SEARCH_POPUP, CONFIRM_DELETE_POPUP,
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
    console.log(`Set hash to empty in handleHash.`);
  }
};

export const onUrlHashChange = (oldUrl, newUrl, dispatch, getState) => {
  console.log('onUrlHashChange called.', oldUrl, newUrl);
  const oldUrlObj = new Url(oldUrl, {});
  const oldHashObj = urlHashToObj(oldUrlObj.hash);

  const newUrlObj = new Url(newUrl, {});
  const newHashObj = urlHashToObj(newUrlObj.hash);

  // Note id
  if ('n' in oldHashObj && 'n' in newHashObj) {
    if (oldHashObj['n'] === newHashObj['n']) {
      // something else changed, do nothing here.
    } else {
      // maybe user fast clicks
    }
  } else if ('n' in oldHashObj && !('n' in newHashObj)) {
    // Unselect note id
    dispatch(updateNoteId(null));
  } else if (!('n' in oldHashObj) && 'n' in newHashObj) {
    // Select note id
    dispatch(updateNoteId(newHashObj['n']));
  }

  // Popup
  if ('p' in oldHashObj && 'p' in newHashObj) {
    if (oldHashObj['p'] === newHashObj['p']) {
      // something else changed, do nothing here.
    } else {
      // i.e. from profilePopup to settingsPopup
      dispatch(updatePopup(oldHashObj['p'], false, null));

      let anchorPosition = null;
      if (newHashObj['ppt']) anchorPosition = {
        x: parseInt(newHashObj['ppx']),
        y: parseInt(newHashObj['ppy']),
        width: parseInt(newHashObj['ppw']),
        height: parseInt(newHashObj['pph']),
        top: parseInt(newHashObj['ppt']),
        right: parseInt(newHashObj['ppr']),
        bottom: parseInt(newHashObj['ppb']),
        left: parseInt(newHashObj['ppl']),
      }
      dispatch(updatePopup(newHashObj['p'], true, anchorPosition));
    }
  } else if ('p' in oldHashObj && !('p' in newHashObj)) {
    // Close popup
    dispatch(updatePopup(oldHashObj['p'], false, null));
  } else if (!('p' in oldHashObj) && 'p' in newHashObj) {
    // Open popup
    let anchorPosition = null;
    if (newHashObj['ppt']) anchorPosition = {
      x: parseInt(newHashObj['ppx']),
      y: parseInt(newHashObj['ppy']),
      width: parseInt(newHashObj['ppw']),
      height: parseInt(newHashObj['pph']),
      top: parseInt(newHashObj['ppt']),
      right: parseInt(newHashObj['ppr']),
      bottom: parseInt(newHashObj['ppb']),
      left: parseInt(newHashObj['ppl']),
    }
    dispatch(updatePopup(newHashObj['p'], true, anchorPosition));
  }

  // search popup
  if ('sp' in oldHashObj && 'sp' in newHashObj) {
    if (oldHashObj['sp'] === newHashObj['sp']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('sp' in oldHashObj && !('sp' in newHashObj)) {
    // Close search popup
    dispatch(updatePopup(SEARCH_POPUP, false, null));
  } else if (!('sp' in oldHashObj) && 'sp' in newHashObj) {
    // Open search popup
    dispatch(updatePopup(SEARCH_POPUP, true, null));
  }

  // confirm delete popup
  if ('cdp' in oldHashObj && 'cdp' in newHashObj) {
    if (oldHashObj['cdp'] === newHashObj['cdp']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('cdp' in oldHashObj && !('cdp' in newHashObj)) {
    // Close confirm delete popup
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, false, null));
  } else if (!('cdp' in oldHashObj) && 'cdp' in newHashObj) {
    // Open confirm delete popup
    dispatch(updatePopup(CONFIRM_DELETE_POPUP, true, null));
  }

  // is bulk editing?
  if ('ibe' in oldHashObj && 'ibe' in newHashObj) {
    if (oldHashObj['ibe'] === newHashObj['ibe']) {
      // something else changed, do nothing here.
    } else {
      throw new Error(`Shouldn't reach here!`);
    }
  } else if ('ibe' in oldHashObj && !('ibe' in newHashObj)) {
    // Exit bulk editing
    dispatch(updateBulkEdit(false));
    dispatch(clearSelectedNoteIds());
  } else if (!('ibe' in oldHashObj) && 'ibe' in newHashObj) {
    // Enter bulk editing
    dispatch(updateBulkEdit(true));
  }
};

export const updateUrlHash = (q, doReplace = false) => {
  const hashObj = { ...urlHashToObj(window.location.hash), ...q };
  const updatedHash = objToUrlHash(hashObj);

  if (doReplace) {
    const urlObj = new Url(window.location.href, {});
    urlObj.set('hash', updatedHash);
    window.location.replace(urlObj.toString());
  } else window.location.hash = updatedHash;
};

export const changeListName = (listName) => async (dispatch, getState) => {

  dispatch({
    type: UPDATE_LIST_NAME,
    payload: listName,
  })

  dispatch(clearSelectedNoteIds());
};

export const updateNoteIdUrlHash = (id) => {
  if (!id) {
    window.history.back();
    return;
  }

  const obj = { n: id };
  updateUrlHash(obj);
};

export const updateNoteId = (id) => {
  return {
    type: UPDATE_NOTE_ID,
    payload: id,
  };
};

export const updatePopupUrlHash = (id, isShown, anchorPosition, doReplace = false) => {
  if (!isShown) {
    window.history.back();
    return;
  }

  // searchPopup and confirmDeletePopup uses diff key because can display together with others
  let obj;
  if (id === SEARCH_POPUP) obj = { sp: true };
  else if (id === CONFIRM_DELETE_POPUP) obj = { cdp: true };
  else {
    obj = {
      p: id,
      ppx: anchorPosition ? Math.round(anchorPosition.x) : null,
      ppy: anchorPosition ? Math.round(anchorPosition.y) : null,
      ppw: anchorPosition ? Math.round(anchorPosition.width) : null,
      pph: anchorPosition ? Math.round(anchorPosition.height) : null,
      ppt: anchorPosition ? Math.round(anchorPosition.top) : null,
      ppr: anchorPosition ? Math.round(anchorPosition.right) : null,
      ppb: anchorPosition ? Math.round(anchorPosition.bottom) : null,
      ppl: anchorPosition ? Math.round(anchorPosition.left) : null,
    };
  }
  updateUrlHash(obj, doReplace);
};

export const updatePopup = (id, isShown, anchorPosition) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const updateSearchString = (searchString) => {
  return {
    type: UPDATE_SEARCH_STRING,
    payload: searchString,
  };
};

export const updateBulkEditUrlHash = (isBulkEditing, doReplace = false) => {
  if (!isBulkEditing) {
    window.history.back();
    return;
  }

  const obj = {
    ibe: true,
    p: null, ppt: null, ppr: null, ppb: null, ppl: null, ppw: null, pph: null,
  };
  updateUrlHash(obj, doReplace);
};

export const updateBulkEdit = (isBulkEditing) => {
  return {
    type: UPDATE_BULK_EDITING,
    payload: isBulkEditing,
  };
};

export const addSelectedNoteIds = (ids) => {
  return {
    type: ADD_SELECTED_NOTE_IDS,
    payload: ids,
  };
};

export const deleteSelectedNoteIds = (ids) => {
  return {
    type: DELETE_SELECTED_NOTE_IDS,
    payload: ids,
  };
};

export const clearSelectedNoteIds = () => {
  return {
    type: CLEAR_SELECTED_NOTE_IDS
  };
};
