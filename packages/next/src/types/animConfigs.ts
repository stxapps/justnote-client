import { Variants } from 'motion/react';

export const popupBgFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.075 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.1 } },
};

export const popupFMV: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ease: 'easeOut', duration: 0.1 },
  },
};

export const dialogBgFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.3 } },
};

export const dialogFMV: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

export const canvasFMV: Variants = {
  hidden: {
    transition: { when: 'afterChildren' },
    visibility: 'hidden',
  },
  visible: {
    visibility: 'visible',
  },
  vanish: {
    transition: { when: 'afterChildren' },
    visibility: 'hidden',
  },
};

export const sideBarOverlayFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.2 } },
};

export const sideBarFMV: Variants = {
  hidden: {
    translateX: '-100%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
};

export const rightPanelFMV: Variants = {
  hidden: {
    translateX: '100%',
    transition: { ease: 'easeIn', duration: 0.2 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.2 },
  },
  vanish: {
    translateX: '100%',
    transition: { ease: 'easeIn', duration: 0 },
  },
};

export const listsFMV: Variants = {
  hidden: {
    scaleY: 0,
    translateY: '-100%',
    transition: { ease: 'easeIn', duration: 0.15 },
  },
  visible: {
    scaleY: 1,
    translateY: '0%',
    transition: { ease: 'easeOut', duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { ease: 'easeIn', duration: 0.15 }
  },
};

export const slideYFMV: Variants = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.075 } },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.1 } },
};

export const slideFMV = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.225,
};
