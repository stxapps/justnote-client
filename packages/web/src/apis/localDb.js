import * as idb from 'idb-keyval';

import {
  NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS, UNSAVED_NOTES, DOT_JSON, PUT_FILE,
  DELETE_FILE,
} from '../types/const';
import {
  isObject, isString, copyFPaths, addFPath, deleteFPath,
} from '../utils';
import { cachedFPaths } from '../vars';

// Need cache to work even without IndexedDB.
let cachedContents = {};

const getFile = async (fpath, dangerouslyIgnoreUndefined = false) => {
  if (fpath in cachedContents) return cachedContents[fpath];

  let content; // If no key, val will be undefined.
  try {
    content = await idb.get(fpath);
  } catch (error) {
    console.log('In localDb.getFile, IndexedDB error:', error);
  }
  if (content === undefined && !dangerouslyIgnoreUndefined) {
    throw new Error(`DoesNotExist: localDb.getFile ${fpath} failed.`);
  }
  if (content !== undefined) {
    if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  }

  // Only cache unsaved notes to not use too much memory.
  if (fpath.startsWith(UNSAVED_NOTES)) cachedContents[fpath] = content;
  return content;
};

const putFile = async (fpath, content) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  try {
    await idb.set(fpath, content);

    if (isObject(cachedFPaths.fpaths) && !fpath.startsWith(UNSAVED_NOTES)) {
      const fpaths = copyFPaths(cachedFPaths.fpaths);
      addFPath(fpaths, fpath);
      cachedFPaths.fpaths = fpaths;
    }
  } catch (error) {
    console.log('In localDb.putFile, IndexedDB error:', error);
  }

  // Only cache unsaved notes to not use too much memory.
  if (fpath.startsWith(UNSAVED_NOTES)) cachedContents[fpath] = content;
};

const deleteFile = async (fpath) => {
  try {
    await idb.del(fpath);

    if (isObject(cachedFPaths.fpaths) && !fpath.startsWith(UNSAVED_NOTES)) {
      const fpaths = copyFPaths(cachedFPaths.fpaths);
      deleteFPath(fpaths, fpath);
      cachedFPaths.fpaths = fpaths;
    }
  } catch (error) {
    console.log('In localDb.deleteFile, IndexedDB error:', error);
  }

  delete cachedContents[fpath];
};

const performFile = async (data) => {
  const { id, type, path: fpath } = data;

  if (type === PUT_FILE) {
    const publicUrl = await putFile(fpath, data.content);
    return { success: true, id, publicUrl };
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

const deleteAllFiles = async () => {
  // BUG Alert: localFile also uses IndexedDB too!
  // Make sure also want to delete all files in localFile as well!
  try {
    await idb.clear();
    cachedFPaths.fpaths = null;
  } catch (error) {
    console.log('In localDb.deleteAllFiles, IndexedDB error:', error);
  }

  cachedContents = {};
};

const listFiles = async (callback) => {
  let keys;
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localDb.listFiles, IndexedDB error:', error);
    keys = [];
  }

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
  const file = await getFile(fpath, true);
  return file !== undefined;
};

const getUnsavedNoteFPaths = async () => {
  let keys;
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localDb.getUnsavedNoteFPaths, IndexedDB error:', error);
    keys = Object.keys(cachedContents);
  }

  const fpaths = [];
  for (let key of keys) {
    key = `${key}`; // Force key to be only string, no number.
    if (key.startsWith(UNSAVED_NOTES + '/')) fpaths.push(key);
  }
  return fpaths;
};

const canUseSync = async () => {
  try {
    await idb.get('get-to-find-can-use-idb');
    return true;
  } catch (error) {
    console.log('In localDb.canUseIdb, IndexedDB error:', error);
  }
  return false;
};

const localDb = {
  cachedFPaths, getFile, performFiles, deleteAllFiles, listFiles, exists,
  getUnsavedNoteFPaths, canUseSync,
};

export default localDb;
