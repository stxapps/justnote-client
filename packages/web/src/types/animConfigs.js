export const popupBgFMV = {
  hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.075 }, },
  visible: { opacity: 0.25, transition: { ease: 'easeOut', duration: 0.1 }, },
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

export const tlPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const trPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const blPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '-50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const brPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '50%',
    translateY: '50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const tcPopupFMV = {
  hidden: {
    scale: 0,
    translateX: '0%',
    translateY: '-50%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, translateX: '0%', translateY: '0%' },
};

export const ccPopupFMV = {
  hidden: {
    scale: 0,
    //translateX: '0%',
    //translateY: '0%',
    transition: { duration: 0.25 },
  },
  visible: { scale: 1, /*translateX: '0%', translateY: '0%'*/ },
};

export const tPopupFMV = {
  hidden: {
    scaleY: 0,
    transition: { duration: 0.25 },
  },
  visible: { scaleY: 1 },
};
