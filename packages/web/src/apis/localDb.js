import * as idb from 'idb-keyval';

import { DOT_JSON, UNSAVED_NOTES } from '../types/const';
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

const getFiles = async (fpaths, dangerouslyIgnoreUndefined = false) => {
  const contents = [];
  for (const fpath of fpaths) {
    const content = await getFile(fpath, dangerouslyIgnoreUndefined);
    contents.push(content);
  }
  return { fpaths, contents };
};

const putFile = async (fpath, content) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  try {
    await idb.set(fpath, content);
  } catch (error) {
    console.log('In localDb.putFile, IndexedDB error:', error);
  }

  // Only cache unsaved notes to not use too much memory.
  if (fpath.startsWith(UNSAVED_NOTES)) cachedContents[fpath] = content;
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0; i < fpaths.length; i++) {
    await putFile(fpaths[i], contents[i]);
  }
};

const deleteFile = async (fpath) => {
  try {
    await idb.del(fpath);
  } catch (error) {
    console.log('In localDb.deleteFile, IndexedDB error:', error);
  }

  delete cachedContents[fpath];
};

const deleteFiles = async (fpaths) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath);
  }
};

const deleteAllFiles = async () => {
  // BUG Alert: localFile also uses IndexedDB too!
  // Make sure also want to delete all files in localFile as well!
  try {
    await idb.clear();
  } catch (error) {
    console.log('In localDb.deleteAllFiles, IndexedDB error:', error);
  }

  cachedContents = {};
};

const listFiles = async (callback) => {
  let keys = [];
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localDb.listFiles, IndexedDB error:', error);
    keys = Object.keys(cachedContents);
  }
  keys = keys.map(key => `${key}`).filter(key => !key.startsWith(UNSAVED_NOTES));

  for (const key of keys) callback(key);
  return keys.length;
};

const listKeys = async () => {
  let keys = [];
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localDb.listKeys, IndexedDB error:', error);
    keys = Object.keys(cachedContents);
  }
  keys = keys.map(key => `${key}`); // Force key to be only string, no number.

  return keys;
};

const exists = async (fpath) => {
  const file = await getFile(fpath, true);
  return file !== undefined;
};

const localDb = {
  cachedFPaths, getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles,
  deleteAllFiles, listFiles, listKeys, exists,
};

export default localDb;
