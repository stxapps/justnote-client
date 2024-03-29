import * as idb from 'idb-keyval';

import { CD_ROOT, IMAGES } from '../types/const';

const Dirs = { DocumentDir: 'DocumentDir' };

// Need cache to work even without IndexedDB.
let cachedContents = {};

const deriveFPath = (fpath, dir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }
  return fpath;
};

const getFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  if (fpath in cachedContents) return cachedContents[fpath];

  let content; // If no key, val will be undefined.
  try {
    content = await idb.get(fpath);
  } catch (error) {
    console.log('In localFile.getFile, IndexedDB error:', error);
    return content;
  }

  cachedContents[fpath] = content;
  return content;
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  try {
    await idb.set(fpath, content);
  } catch (error) {
    console.log('In localFile.putFile, IndexedDB error:', error);
  }

  cachedContents[fpath] = content;
};

const deleteFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  try {
    await idb.del(fpath);
  } catch (error) {
    console.log('In localFile.deleteFile, IndexedDB error:', error);
  }

  delete cachedContents[fpath];
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async (dir = Dirs.DocumentDir) => {
  // BUG Alert: localDb also uses IndexedDB too!
  // Use localDb for delete all files in both localDb and localFile for now!
  /*try {
    await idb.clear();
  } catch (error) {
    console.log('In localFile.deleteAllFiles, IndexedDB error:', error);
  }*/

  cachedContents = {};
};

const getStaticFPaths = async () => {
  let keys;
  try {
    keys = await idb.keys();
  } catch (error) {
    console.log('In localFile.getStaticFPaths, IndexedDB error:', error);
    keys = Object.keys(cachedContents);
  }

  const fpaths = [];
  for (let key of keys) {
    key = `${key}`; // Force key to be only string, no number.
    if (key.startsWith(Dirs.DocumentDir)) {
      key = key.slice(Dirs.DocumentDir.length + 1);
      if (key.startsWith(IMAGES + '/')) fpaths.push(key);
    }
  }
  return fpaths;
};

const localFile = {
  getFile, putFile, deleteFile, deleteFiles, deleteAllFiles, getStaticFPaths,
};

export default localFile;
