import * as idb from 'idb-keyval';

import { DOT_JSON } from '../types/const';
import { cachedFPaths } from '../vars';

const getFile = async (path, options = {}) => {
  let content = await idb.get(path);
  if (content === undefined) {
    throw new Error(`DoesNotExist: localDb.getFile ${path} failed.`);
  }

  if (path.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = (path, content, options = putFileOptions) => {
  if (path.endsWith(DOT_JSON)) content = JSON.stringify(content);
  return idb.set(path, content);
};

const deleteFile = (path, options = {}) => {
  return idb.del(path);
};

const listFiles = async (callback) => {
  const keys = await idb.keys();
  for (const key of keys) callback(key);
  return keys.length;
};

const localDb = { cachedFPaths, getFile, putFile, deleteFile, listFiles };

export default localDb;
