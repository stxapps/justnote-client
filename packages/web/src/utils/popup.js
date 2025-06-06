const ZERO = 'ZERO'; // top or left of the window
const CENTER = 'CENTER'; // center of the window
//const EDGE = 'EDGE'; // bottom or right of the window
const AT_TRIGGER = 'AT_TRIGGER'; // top or left of the trigger
const CENTER_TRIGGER = 'CENTER_TRIGGER'; // center of the trigger
const EDGE_TRIGGER = 'EDGE_TRIGGER'; // bottom or right of the trigger

// oDim: options dimension, oSpc: options and window space
// wDim: window dimension
// tPos: trigger position, tDim: trigger dimension
// iBgn: inset begin, iEd: inset end
const axisPosition = (oDim, oSpc, wDim, tPos, tDim, iBgn, iEd) => {
  // if options are bigger than window dimension, then render at 0
  if (oDim > wDim - iBgn - iEd) {
    return [oSpc, ZERO];
  }
  // render at trigger position if possible
  if (tPos + oDim + oSpc + iEd <= wDim) {
    return [tPos, AT_TRIGGER];
  }
  // aligned to the trigger from the bottom (right)
  if (tPos + tDim - oDim - oSpc - iBgn >= 0) {
    return [tPos + tDim - oDim, EDGE_TRIGGER];
  }
  // compute center position
  const pos = Math.round(tPos + (tDim / 2) - (oDim / 2));
  // top boundary overflows, render at window center instead
  if (pos - oSpc - iBgn < 0) {
    return [Math.round((wDim - oDim) / 2), CENTER];
  }
  // bottom boundary overflows, render at window center instead
  if (pos + oDim + oSpc + iEd > wDim) {
    return [Math.round((wDim - oDim) / 2), CENTER];
  }
  // if everything ok, render in center position
  return [pos, CENTER_TRIGGER];
};

const computePosition = (
  triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin = 0,
) => {
  let { x: tX, y: tY, height: tHeight, width: tWidth } = triggerLayout;
  if (triggerOffsets) {
    const { x: xOffset, y: yOffset, width: wOffset, height: hOffset } = triggerOffsets;
    tX = tX + xOffset;
    tY = tY + yOffset;
    tWidth = tWidth + wOffset;
    tHeight = tHeight + hOffset;
  }
  const { height: oHeight, width: oWidth } = optionsLayout;
  const { x: wX, y: wY, width: wWidth, height: wHeight } = windowLayout;

  const [top, topOrigin] = axisPosition(
    oHeight, popupMargin, wHeight, tY - wY, tHeight, insets.top, insets.bottom,
  );
  const [left, leftOrigin] = axisPosition(
    oWidth, popupMargin, wWidth, tX - wX, tWidth, insets.left, insets.right,
  );

  return { top, left, topOrigin, leftOrigin };
};

const getOriginStyle = (topOrigin, leftOrigin) => {
  if (topOrigin === AT_TRIGGER && leftOrigin === AT_TRIGGER) {
    return { transformOrigin: 'top left' };
  } else if (topOrigin === AT_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return { transformOrigin: 'top right' };
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === AT_TRIGGER) {
    return { transformOrigin: 'bottom left' };
  } else if (topOrigin === EDGE_TRIGGER && leftOrigin === EDGE_TRIGGER) {
    return { transformOrigin: 'bottom right' };
  } else {
    return { transformOrigin: 'center' };
  }
};

export const computePositionStyle = (
  triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin = 0,
) => {
  const { top, left, topOrigin, leftOrigin } = computePosition(
    triggerLayout, optionsLayout, windowLayout, triggerOffsets, insets, popupMargin,
  );
  const { transformOrigin } = getOriginStyle(topOrigin, leftOrigin);

  return { top, left, transformOrigin };
};
