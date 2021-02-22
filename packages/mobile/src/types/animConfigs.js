import { Easing } from 'react-native';

export const popupFMV = {
  hidden: {
    duration: 75,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  },
  visible: {
    duration: 100,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }
};
