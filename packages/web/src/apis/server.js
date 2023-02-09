import { Storage } from '@stacks/storage/dist/esm';

import userSession from '../userSession';
import { DOT_JSON } from '../types/const';
import { cachedServerFPaths } from '../vars';

const _userSession = userSession._userSession;

const getFile = async (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  let content = /** @type {any} */(await storage.getFile(fpath, options));
  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = (fpath, content, options = putFileOptions) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  const storage = new Storage({ userSession: _userSession });
  return storage.putFile(fpath, content, options);
};

const deleteFile = (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.deleteFile(fpath, options);
};

const listFiles = (callback) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.listFiles(callback);
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, putFile, deleteFile, listFiles,
};

export default server;
