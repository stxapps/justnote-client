import MMKVStorage from 'react-native-mmkv-storage';

import { COLS_PANEL_STATE, INDEX, SETTINGS, DOT_JSON } from './types/const';

let _instance = null;

const getInstance = () => {
  if (!_instance) _instance = new MMKVStorage.Loader().initialize();
  return _instance;
};

const putFile = async (path, content) => {
  if (path.endsWith(INDEX + DOT_JSON) || path.startsWith(SETTINGS)) {
    await getInstance().setMapAsync(path, content);
  } else await getInstance().setStringAsync(path, content);

  return path;
};

const getFile = async (path) => {
  try {
    if (path.endsWith(INDEX + DOT_JSON) || path.startsWith(SETTINGS)) {
      return await getInstance().getMapAsync(path);
    }
    return await getInstance().getStringAsync(path);
  } catch (e) {
    console.log('getFile error: ', e);
    return null;
  }
};

const deleteFile = async (path) => {
  await getInstance().removeItem(path);
  return true;
};

const listFiles = async (callback) => {
  const files = await getInstance().indexer.getKeys();
  files.forEach(file => {
    if ([
      COLS_PANEL_STATE,
      'default', 'boolIndex', 'numberIndex', 'stringIndex', 'arrayIndex', 'mapIndex',
    ].includes(file)) return;
    callback(file);
  });
  return files.length;
};

const getItem = (key) => {
  return getInstance().getString(key);
};

const setItem = (key, value) => {
  getInstance().setString(key, value);
};

export default {
  putFile, getFile, deleteFile, listFiles,
  getItem, setItem,
};
