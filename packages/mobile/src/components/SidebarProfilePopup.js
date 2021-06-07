import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, Linking, BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { signOut, updatePopup } from '../actions';
import { DOMAIN_NAME, PROFILE_POPUP, SETTINGS_POPUP } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';
import { popupFMV } from '../types/animConfigs';

const SidebarProfilePopup = () => {

  const isShown = useSelector(state => state.display.isProfilePopupShown);
  const anchorPosition = useSelector(state => state.display.profilePopupPosition);
  const [didCloseAnimEnd, setDidCloseAnimEnd] = useState(!isShown);
  const [derivedIsShown, setDerivedIsShown] = useState(isShown);
  const [derivedAnchorPosition, setDerivedAnchorPosition] = useState(anchorPosition);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupBackHandler = useRef(null);
  const dispatch = useDispatch();

  const onProfileCancelBtnClick = useCallback(() => {
    dispatch(updatePopup(PROFILE_POPUP, false, null));
  }, [dispatch]);

  const onSettingsBtnClick = () => {
    onProfileCancelBtnClick();
    dispatch(updatePopup(SETTINGS_POPUP, true, null));
  };

  const onSupportBtnClick = () => {
    onProfileCancelBtnClick();
    Linking.openURL(DOMAIN_NAME + '/support');
  };

  const onSignOutBtnClick = () => {
    onProfileCancelBtnClick();
    dispatch(signOut());
  };

  const registerPopupBackHandler = useCallback((doRegister) => {
    if (doRegister) {
      if (!popupBackHandler.current) {
        popupBackHandler.current = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            onProfileCancelBtnClick();
            return true;
          }
        );
      }
    } else {
      if (popupBackHandler.current) {
        popupBackHandler.current.remove();
        popupBackHandler.current = null;
      }
    }
  }, [onProfileCancelBtnClick]);

  useEffect(() => {
    let didMount = true;
    if (isShown) {
      Animated.timing(popupAnim, { toValue: 1, ...popupFMV.visible }).start();
    } else {
      Animated.timing(popupAnim, { toValue: 0, ...popupFMV.hidden }).start(() => {
        if (didMount) setDidCloseAnimEnd(true);
      });
    }

    registerPopupBackHandler(isShown);
    return () => {
      didMount = false;
      registerPopupBackHandler(false);
    };
  }, [isShown, popupAnim, registerPopupBackHandler]);

  if (derivedIsShown !== isShown) {
    if (derivedIsShown && !isShown) setDidCloseAnimEnd(false);
    setDerivedIsShown(isShown);
  }

  if (!isShown && didCloseAnimEnd) return null;

  if (anchorPosition && anchorPosition !== derivedAnchorPosition) {
    setDerivedAnchorPosition(anchorPosition);
  }

  if (!derivedAnchorPosition) return null;

  const popupStyle = {
    width: derivedAnchorPosition.width,
    top: derivedAnchorPosition.top + derivedAnchorPosition.height,
    left: derivedAnchorPosition.left,
    opacity: popupAnim,
    transform: [
      { scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
      {
        translateY: popupAnim.interpolate({
          inputRange: [0, 1], outputRange: [-1 * 0.05 * 140, 0],
        }),
      },
    ],
  };

  return (
    <React.Fragment>
      <TouchableWithoutFeedback onPress={onProfileCancelBtnClick}>
        <View style={tailwind('absolute inset-0 opacity-25 bg-black')} />
      </TouchableWithoutFeedback>
      <Animated.View style={[tailwind('absolute mt-1 rounded-md shadow-lg bg-white'), popupStyle]}>
        <View style={tailwind('py-1')}>
          <TouchableOpacity onPress={onSettingsBtnClick} style={tailwind('w-full flex-row items-center px-4 py-3')}>
            <Svg width={20} height={20} style={tailwind('mr-3 text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17C11.11 1.61 8.88999 1.61 8.50999 3.17C8.45326 3.40442 8.34198 3.62213 8.18522 3.80541C8.02845 3.9887 7.83063 4.13238 7.60784 4.22477C7.38505 4.31716 7.1436 4.35564 6.90313 4.33709C6.66266 4.31854 6.42997 4.24347 6.22399 4.118C4.85199 3.282 3.28199 4.852 4.11799 6.224C4.65799 7.11 4.17899 8.266 3.17099 8.511C1.60999 8.89 1.60999 11.111 3.17099 11.489C3.40547 11.5458 3.62322 11.6572 3.80651 11.8141C3.98979 11.971 4.13343 12.1689 4.22573 12.3918C4.31803 12.6147 4.35639 12.8563 4.33766 13.0968C4.31894 13.3373 4.24367 13.5701 4.11799 13.776C3.28199 15.148 4.85199 16.718 6.22399 15.882C6.42993 15.7563 6.66265 15.6811 6.90318 15.6623C7.14371 15.6436 7.38527 15.682 7.60817 15.7743C7.83108 15.8666 8.02904 16.0102 8.18592 16.1935C8.34281 16.3768 8.45419 16.5945 8.51099 16.829C8.88999 18.39 11.111 18.39 11.489 16.829C11.546 16.5946 11.6575 16.377 11.8144 16.1939C11.9713 16.0107 12.1692 15.8672 12.3921 15.7749C12.6149 15.6826 12.8564 15.6442 13.0969 15.6628C13.3373 15.6815 13.57 15.7565 13.776 15.882C15.148 16.718 16.718 15.148 15.882 13.776C15.7565 13.57 15.6815 13.3373 15.6628 13.0969C15.6442 12.8564 15.6826 12.6149 15.7749 12.3921C15.8672 12.1692 16.0107 11.9713 16.1939 11.8144C16.377 11.6575 16.5946 11.546 16.829 11.489C18.39 11.11 18.39 8.889 16.829 8.511C16.5945 8.45419 16.3768 8.34281 16.1935 8.18593C16.0102 8.02904 15.8666 7.83109 15.7743 7.60818C15.682 7.38527 15.6436 7.14372 15.6623 6.90318C15.681 6.66265 15.7563 6.42994 15.882 6.224C16.718 4.852 15.148 3.282 13.776 4.118C13.5701 4.24368 13.3373 4.31895 13.0968 4.33767C12.8563 4.35639 12.6147 4.31804 12.3918 4.22574C12.1689 4.13344 11.971 3.9898 11.8141 3.80651C11.6572 3.62323 11.5458 3.40548 11.489 3.171L11.49 3.17ZM9.99999 13C10.7956 13 11.5587 12.6839 12.1213 12.1213C12.6839 11.5587 13 10.7956 13 10C13 9.20435 12.6839 8.44129 12.1213 7.87868C11.5587 7.31607 10.7956 7 9.99999 7C9.20434 7 8.44128 7.31607 7.87867 7.87868C7.31606 8.44129 6.99999 9.20435 6.99999 10C6.99999 10.7956 7.31606 11.5587 7.87867 12.1213C8.44128 12.6839 9.20434 13 9.99999 13Z" />
            </Svg>
            <Text style={tailwind('text-sm text-gray-700 font-normal')}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSupportBtnClick} style={tailwind('w-full flex-row items-center px-4 py-3')}>
            <Svg width={20} height={20} style={tailwind('mr-3 text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 12.1217 17.1571 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18C7.87827 18 5.84344 17.1571 4.34315 15.6569C2.84285 14.1566 2 12.1217 2 10C2 7.87827 2.84285 5.84344 4.34315 4.34315C5.84344 2.84285 7.87827 2 10 2C12.1217 2 14.1566 2.84285 15.6569 4.34315C17.1571 5.84344 18 7.87827 18 10ZM16 10C16 10.993 15.759 11.929 15.332 12.754L13.808 11.229C14.0362 10.5227 14.0632 9.76679 13.886 9.046L15.448 7.484C15.802 8.249 16 9.1 16 10ZM10.835 13.913L12.415 15.493C11.654 15.8281 10.8315 16.0007 10 16C9.13118 16.0011 8.27257 15.8127 7.484 15.448L9.046 13.886C9.63267 14.0298 10.2443 14.039 10.835 13.913ZM6.158 11.117C5.96121 10.4394 5.94707 9.72182 6.117 9.037L6.037 9.117L4.507 7.584C4.1718 8.34531 3.99913 9.16817 4 10C4 10.954 4.223 11.856 4.619 12.657L6.159 11.117H6.158ZM7.246 4.667C8.09722 4.22702 9.04179 3.99825 10 4C10.954 4 11.856 4.223 12.657 4.619L11.117 6.159C10.3493 5.93538 9.53214 5.94687 8.771 6.192L7.246 4.668V4.667ZM12 10C12 10.5304 11.7893 11.0391 11.4142 11.4142C11.0391 11.7893 10.5304 12 10 12C9.46957 12 8.96086 11.7893 8.58579 11.4142C8.21071 11.0391 8 10.5304 8 10C8 9.46957 8.21071 8.96086 8.58579 8.58579C8.96086 8.21071 9.46957 8 10 8C10.5304 8 11.0391 8.21071 11.4142 8.58579C11.7893 8.96086 12 9.46957 12 10Z" />
            </Svg>
            <Text style={tailwind('text-sm text-gray-700 font-normal')}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignOutBtnClick} style={tailwind('w-full flex-row items-center px-4 py-3')}>
            <Svg width={20} height={20} style={tailwind('mr-3 text-gray-400 font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M3 3C2.73478 3 2.48043 3.10536 2.29289 3.29289C2.10536 3.48043 2 3.73478 2 4V16C2 16.2652 2.10536 16.5196 2.29289 16.7071C2.48043 16.8946 2.73478 17 3 17C3.26522 17 3.51957 16.8946 3.70711 16.7071C3.89464 16.5196 4 16.2652 4 16V4C4 3.73478 3.89464 3.48043 3.70711 3.29289C3.51957 3.10536 3.26522 3 3 3ZM13.293 12.293C13.1108 12.4816 13.01 12.7342 13.0123 12.9964C13.0146 13.2586 13.1198 13.5094 13.3052 13.6948C13.4906 13.8802 13.7414 13.9854 14.0036 13.9877C14.2658 13.99 14.5184 13.8892 14.707 13.707L17.707 10.707C17.8945 10.5195 17.9998 10.2652 17.9998 10C17.9998 9.73484 17.8945 9.48053 17.707 9.293L14.707 6.293C14.6148 6.19749 14.5044 6.12131 14.3824 6.0689C14.2604 6.01649 14.1292 5.9889 13.9964 5.98775C13.8636 5.9866 13.7319 6.0119 13.609 6.06218C13.4861 6.11246 13.3745 6.18671 13.2806 6.2806C13.1867 6.3745 13.1125 6.48615 13.0622 6.60905C13.0119 6.73194 12.9866 6.86362 12.9877 6.9964C12.9889 7.12918 13.0165 7.2604 13.0689 7.3824C13.1213 7.50441 13.1975 7.61475 13.293 7.707L14.586 9H7C6.73478 9 6.48043 9.10536 6.29289 9.29289C6.10536 9.48043 6 9.73478 6 10C6 10.2652 6.10536 10.5196 6.29289 10.7071C6.48043 10.8946 6.73478 11 7 11H14.586L13.293 12.293Z" />
            </Svg>
            <Text style={tailwind('text-sm text-gray-700 font-normal')}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </React.Fragment>
  );
};

export default React.memo(SidebarProfilePopup);
