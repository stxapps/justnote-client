import {
  INIT, UPDATE_WINDOW_SIZE, UPDATE_USER,
} from '../types/actionTypes';
import {
  APP_NAME, APP_ICON_NAME,
} from '../types/const';
import { throttle } from '../utils';

export const init = () => async (dispatch, getState) => {

  await handlePendingSignIn()(dispatch, getState);

  //const isUserSignedIn = userSession.isUserSignedIn();
  const isUserSignedIn = false;
  let username = null, userImage = null;
  if (isUserSignedIn) {
    //const userData = userSession.loadUserData();
    //username = userData.username;
    //userImage = getUserImageUrl(userData);
  }

  // Handle fragment in the url


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

  /*
    update when fragment in the url changed

  window.addEventListener('popstate', function () {
    popHistoryState(store);
  });
  */
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

};
