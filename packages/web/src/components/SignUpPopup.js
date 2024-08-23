import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showConnect } from '@stacks/connect';
import { motion, AnimatePresence } from 'framer-motion';

import userSession from '../userSession';
import { updatePopupUrlHash, updateUserData, updateUserSignedIn } from '../actions';
import {
  DOMAIN_NAME, APP_NAME, APP_ICON_NAME, APP_SCOPES, SIGN_UP_POPUP, SIGN_IN_POPUP,
} from '../types/const';
import { extractUrl, getUrlPathQueryHash } from '../utils';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';
import Loading from './Loading';
import ErrorBoundary from './ErrorBoundary';

// @ts-expect-error
const _SignUp = import('./SignUp');
const SignUp = React.lazy(() => _SignUp);

const SignUpPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isSignUpPopupShown);
  const cancelBtn = useRef(null);
  const appIconUrl = useMemo(() => {
    return extractUrl(window.location.href).origin + '/' + APP_ICON_NAME;
  }, []);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onPopupCloseBtnClick = () => {
    updatePopupUrlHash(SIGN_UP_POPUP, false);
  };

  const onSignUpWithHiroWalletBtnClick = () => {
    onPopupCloseBtnClick();

    const authOptions = {
      appDetails: { name: APP_NAME, icon: appIconUrl },
      redirectTo: '/' + getUrlPathQueryHash(window.location.href),
      onFinish: () => dispatch(updateUserSignedIn()),
      userSession: userSession._userSession,
      sendToSignIn: false,
    };
    showConnect(authOptions);
  };

  const onSignInBtnClick = () => {
    updatePopupUrlHash(SIGN_IN_POPUP, true, null, true);
  };

  const onBackedUpBtnClick = (data) => {
    onPopupCloseBtnClick();
    dispatch(updateUserData(data));
  };

  useEffect(() => {
    if (isShown) cancelBtn.current.focus();
  }, [isShown]);

  if (!isShown) return <AnimatePresence key="AnimatePresence_SUP" />;

  const panelHeight = Math.min(576, safeAreaHeight * 0.9);

  return (
    <AnimatePresence key="AnimatePresence_SUP">
      <div className={tailwind('fixed inset-0 overflow-hidden')}>
        <div className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: safeAreaHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of SignUpPopup */}
            <motion.button ref={cancelBtn} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white')} style={{ height: panelHeight }}>
              <ErrorBoundary isInPopup={true}>
                <React.Suspense fallback={<Loading />}>
                  <SignUp domainName={DOMAIN_NAME} appName={APP_NAME} appIconUrl={appIconUrl} appScopes={APP_SCOPES} onPopupCloseBtnClick={onPopupCloseBtnClick} onSignUpWithHiroWalletBtnClick={onSignUpWithHiroWalletBtnClick} onSignInBtnClick={onSignInBtnClick} onBackedUpBtnClick={onBackedUpBtnClick} />
                </React.Suspense>
              </ErrorBoundary>
            </div>
          </motion.div>
        </div>
      </div >
    </AnimatePresence>
  );
};

export default React.memo(SignUpPopup);
