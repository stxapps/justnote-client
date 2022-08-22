import { WHT_MODE, BLK_MODE } from '../types/const';
import { isNumber } from '../utils';

const THEME_MODES = [WHT_MODE, BLK_MODE];
const THEME_PREFIXES = ['', 'blk:'];

const tailwind = (classStr, windowWidth, selectedThemeMode) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }

  const classes = classStr.trim().split(/\s+/);

  const themeBuckets = [];
  for (let i = 0; i < THEME_MODES.length; i++) themeBuckets.push([]);

  for (const className of classes) {
    let i = 0;
    for (let j = 1; j < THEME_PREFIXES.length; j++) {
      const prefix = THEME_PREFIXES[j];
      if (className.includes(prefix)) {
        i = j;
        break;
      }
    }

    themeBuckets[i].push(className);
  }

  let selectedClasses = themeBuckets[0];
  for (let i = 1; i < THEME_MODES.length; i++) {
    if (selectedThemeMode === THEME_MODES[i]) {
      selectedClasses = [...selectedClasses, ...themeBuckets[i]];
      break;
    }
  }

  const selectedClassStr = selectedClasses.join(' ');
  return selectedClassStr;
};

export { tailwind };
