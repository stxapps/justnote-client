export const popupBgFMV = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.075 }, },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.1 }, },
};

export const popupFMV = {
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

export const dialogBgFMV = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.2 }, },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.3 }, },
};

export const dialogFMV = {
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

export const canvasFMV = /** @type {any} */ ({
  hidden: {
    transition: { when: 'afterChildren' },
    transitionEnd: { visibility: 'hidden' },
  },
  visible: {
    visibility: 'visible',
  },
});

export const sideBarOverlayFMV = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.3 }, },
  visible: { opacity: 1, transition: { ease: 'easeOut', duration: 0.3 }, },
};

export const sideBarFMV = {
  hidden: {
    translateX: '-100%',
    transition: { ease: 'easeIn', duration: 0.3 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

export const rightPanelFMV = {
  hidden: {
    translateX: '100%',
    transition: { ease: 'easeIn', duration: 0.3 },
  },
  visible: {
    translateX: '0%',
    transition: { ease: 'easeOut', duration: 0.3 },
  },
};

export const listsFMV = {
  hidden: {
    scaleY: 0,
    translateY: '-100%',
    transition: { ease: 'easeIn', duration: 0.075 },
  },
  visible: {
    scaleY: 1,
    translateY: '0%',
    transition: { ease: 'easeOut', duration: 0.1 },
  },
  exit: {
    opacity: 0,
  },
};

export const slideYFMV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideFMV = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};
