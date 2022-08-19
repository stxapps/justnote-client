import { BLK_MODE } from '../types/const';
import { isNumber } from '../utils';

const THEME_MODES = [BLK_MODE];
const THEME_PREFIXES = ['blk:'];

const tailwind = (classStr, windowWidth, selectedThemeMode) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }

  const classes = classStr.trim().split(/\s+/);

  const themeBuckets = [];
  for (let i = 0; i < THEME_PREFIXES.length + 1; i++) themeBuckets.push([]);

  for (const className of classes) {
    for (let i = 0; i < themeBuckets.length; i++) {
      if (i === themeBuckets.length - 1) {
        themeBuckets[i].push(className);
        break;
      }

      const prefix = THEME_PREFIXES[i];
      if (className.includes(prefix)) {
        themeBuckets[i].push(className);
        break;
      }
    }
  }

  let selectedClasses = themeBuckets[themeBuckets.length - 1];
  for (let i = 0; i < THEME_PREFIXES.length; i++) {
    if (selectedThemeMode === THEME_MODES[i]) {
      selectedClasses = [...selectedClasses, ...themeBuckets[i]];
      break;
    }
  }

  const selectedClassStr = selectedClasses.join(' ');
  return selectedClassStr;
};

export { tailwind };
