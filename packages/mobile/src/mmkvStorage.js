import MMKVStorage from 'react-native-mmkv-storage';

import {
  IS_USER_DUMMY, COLS_PANEL_STATE, INDEX, SETTINGS, DOT_JSON,
} from './types/const';

let _instance = null;

const getInstance = () => {
  if (!_instance) _instance = new MMKVStorage.Loader().initialize();
  return _instance;
};

const isUserDummy = async () => {
  const res = await getInstance().getStringAsync(IS_USER_DUMMY);
  return res === 'true';
};

const updateUserDummy = async (_isUserDummy) => {
  const value = _isUserDummy ? 'true' : 'false';
  await getInstance().setStringAsync(IS_USER_DUMMY, value);
};

const putFile = async (path, content) => {
  if (path.endsWith(INDEX + DOT_JSON) || path.startsWith(SETTINGS)) {
    await getInstance().setMapAsync(path, content);
  } else await getInstance().setStringAsync(path, content);

  return path;
};

const getFile = async (path) => {
  if (path.endsWith(INDEX + DOT_JSON) || path.startsWith(SETTINGS)) {
    return await getInstance().getMapAsync(path);
  }
  return await getInstance().getStringAsync(path);
};

const deleteFile = async (path) => {
  await getInstance().removeItem(path);
  return true;
};

const deleteAllFiles = async () => {
  await getInstance().clearStore();
};

const listFiles = async (callback) => {
  const files = await getInstance().indexer.getKeys();
  files.forEach(file => {
    if ([
      IS_USER_DUMMY, COLS_PANEL_STATE,
      'default',
      'boolIndex', 'numberIndex', 'stringIndex', 'arrayIndex', 'mapIndex',
      'boolsIndex', 'numbersIndex', 'stringsIndex', 'arraysIndex', 'mapsIndex',
    ].includes(file)) return;
    callback(file);
  });
  return files.length;
};

const getItem = async (key) => {
  return await getInstance().getStringAsync(key);
};

const setItem = async (key, value) => {
  await getInstance().setStringAsync(key, value);
};

export default {
  isUserDummy, updateUserDummy,
  putFile, getFile, deleteFile, deleteAllFiles, listFiles,
  getItem, setItem,
};
