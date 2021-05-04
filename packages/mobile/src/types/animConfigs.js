import { LayoutAnimation, Easing } from 'react-native';

export const popupFMV = {
  hidden: {
    duration: 75,
    easing: Easing.in(Easing.bezier(0.4, 0, 1, 1)),
    useNativeDriver: true,
  },
  visible: {
    duration: 100,
    easing: Easing.out(Easing.bezier(0, 0, 0.2, 1)),
    useNativeDriver: true,
  },
};

export const dialogFMV = {
  hidden: {
    duration: 200,
    easing: Easing.in(Easing.bezier(0.4, 0, 1, 1)),
    useNativeDriver: true,
  },
  visible: {
    duration: 300,
    easing: Easing.out(Easing.bezier(0, 0, 0.2, 1)),
    useNativeDriver: true,
  },
};

export const sidebarFMV = {
  hidden: {
    duration: 300,
    easing: Easing.inOut(Easing.bezier(0.4, 0, 0.2, 1)),
    useNativeDriver: true,
  },
  visible: {
    duration: 300,
    easing: Easing.inOut(Easing.bezier(0.4, 0, 0.2, 1)),
    useNativeDriver: true,
  },
};

export const swapAnimConfig = () => {
  return LayoutAnimation.create(
    225,
    LayoutAnimation.Types.easeInEaseOut,
    LayoutAnimation.Properties.scaleY
  );
};

export const rotateAnimConfig = {
  duration: 1000,
  useNativeDriver: true,
};
