import { createSelectorCreator, defaultMemoize } from 'reselect';

import {
  ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING,
  DIED_DELETING,
} from '../types/const';
import {
  isObject, isArrayEqual, isEqual,
  doContainListName,
} from '../utils';

const createSelectorListNameMap = createSelectorCreator(
  defaultMemoize,
  (prevVal, val) => {
    if (!isObject(prevVal['notes']) || !isObject(val['notes'])) {
      if (prevVal['notes'] !== val['notes']) return false;
    }

    if (!isArrayEqual(
      Object.keys(prevVal['notes']).sort(),
      Object.keys(val['notes']).sort()
    )) return false;

    return isEqual(prevVal['settings']['listNameMap'], val['settings']['listNameMap']);
  }
);

export const getListNameMap = createSelectorListNameMap(
  state => state,
  (state) => {

    const listNames = Object.keys(state.notes);
    const listNameMap = [...state.settings.listNameMap.filter(listNameObj => {
      return [ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING].includes(listNameObj.status);
    })];

    let i = 1;
    for (const listName of listNames) {
      // Not in listNameMap and also deleting list name in state.settings.listNameMap.
      if (!doContainListName(listName, state.settings.listNameMap)) {
        listNameMap.push({ listName: listName, displayName: `<missing-name-${i}>` });
        i += 1;
      }
    }

    return listNameMap;
  }
);
