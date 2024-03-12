import MMKVStorage from 'react-native-mmkv-storage';

import {
  IS_USER_DUMMY, NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS, UNSAVED_NOTES, DOT_JSON,
  PUT_FILE, DELETE_FILE,
} from '../types/const';
import { isObject, isString, copyFPaths, addFPath, deleteFPath } from '../utils';
import { cachedFPaths } from '../vars';

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

const getItem = async (key) => {
  return await getInstance().getStringAsync(key);
};

const setItem = async (key, value) => {
  await getInstance().setStringAsync(key, value);
};

const removeItem = async (key) => {
  await getInstance().removeItem(key);
};

const getFile = async (fpath, dangerouslyIgnoreUndefined = false) => {
  let content;
  try {
    if (fpath.endsWith(DOT_JSON)) content = await getInstance().getMapAsync(fpath);
    else content = await getInstance().getStringAsync(fpath);
  } catch (error) {
    console.log('In localDb.getFile, error:', error);
  }
  if (content === undefined && !dangerouslyIgnoreUndefined) {
    throw new Error(`DoesNotExist: localDb.getFile ${fpath} failed.`);
  }

  return content;
};

const putFile = async (fpath, content) => {
  if (fpath.endsWith(DOT_JSON)) await getInstance().setMapAsync(fpath, content);
  else await getInstance().setStringAsync(fpath, content);

  if (isObject(cachedFPaths.fpaths) && !fpath.startsWith(UNSAVED_NOTES)) {
    const fpaths = copyFPaths(cachedFPaths.fpaths);
    addFPath(fpaths, fpath);
    cachedFPaths.fpaths = fpaths;
  }

  return fpath;
};

const deleteFile = async (fpath) => {
  await getInstance().removeItem(fpath);

  if (isObject(cachedFPaths.fpaths) && !fpath.startsWith(UNSAVED_NOTES)) {
    const fpaths = copyFPaths(cachedFPaths.fpaths);
    deleteFPath(fpaths, fpath);
    cachedFPaths.fpaths = fpaths;
  }

  return true;
};

const performFile = async (data) => {
  const { id, type, path: fpath } = data;

  if (type === PUT_FILE) {
    await putFile(fpath, data.content);
    return { success: true, id };
  }

  if (type === DELETE_FILE) {
    await deleteFile(fpath);
    return { success: true, id };
  }

  throw new Error(`Invalid data.type: ${data.type}`);
};

const performFiles = async (data) => {
  const results = [];

  if (Array.isArray(data.values) && [true, false].includes(data.isSequential)) {
    for (const value of data.values) {
      const pResults = await performFiles(value);
      results.push(...pResults);
      if (data.isSequential && pResults.some(result => !result.success)) break;
    }
  } else if (isString(data.id) && isString(data.type) && isString(data.path)) {
    try {
      const result = await performFile(data);
      results.push(result);
    } catch (error) {
      results.push({
        error: error.toString().slice(0, 999), success: false, id: data.id,
      });
    }
  } else {
    console.log('In localDb.performFiles, invalid data:', data);
  }

  return results;
};

const deleteFiles = async (fpaths) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath);
  }
};

const deleteAllFiles = async () => {
  await getInstance().clearStore();
  cachedFPaths.fpaths = null;
};

const listFiles = async (callback) => {
  const keys = await getInstance().indexer.getKeys();

  let count = 0;
  for (let key of keys) {
    key = `${key}`; // Force key to be only string, no number.
    if (
      ![NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => key.startsWith(el))
    ) continue;

    callback(key);
    count += 1;
  }
  return count;
};

const exists = async (fpath) => {
  const hasKey = await getInstance().indexer.hasKey(fpath);
  return hasKey;
};

const getUnsavedNoteFPaths = async () => {
  const keys = await getInstance().indexer.getKeys();

  const fpaths = [];
  for (let key of keys) {
    key = `${key}`; // Force key to be only string, no number.
    if (key.startsWith(UNSAVED_NOTES + '/')) fpaths.push(key);
  }
  return fpaths;
};

const canUseSync = async () => {
  return true;
};

const localDb = {
  isUserDummy, updateUserDummy, getItem, setItem, removeItem,
  cachedFPaths, getFile, putFile, deleteFile, performFiles, deleteFiles, deleteAllFiles,
  listFiles, exists, getUnsavedNoteFPaths, canUseSync,
};

export default localDb;
