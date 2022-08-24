import { create } from 'tailwind-rn';

import { WHT_MODE, BLK_MODE } from '../types/const';
import { isNumber } from '../utils';

import tailwindStyles from './tailwind.json';
import extrasStyles from './extras.json';

const styles = { ...tailwindStyles, ...extrasStyles };
const { tailwind: _tailwind, getColor } = create(styles);

const THEME_MODES = [WHT_MODE, BLK_MODE];
const THEME_PREFIXES = ['', 'blk:'];

const tailwind = (classStr, windowWidth, selectedThemeMode) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }

  const v1 = classStr.includes('text') ? 1 : 0;
  const v2 = classStr.includes('font') ? 1 : 0;
  if (v1 + v2 === 1) console.warn('Need to have both text size and font weight!');

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




  return _tailwind(classStr, windowWidth);
};

export { tailwind, getColor };
