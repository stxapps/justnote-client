import { Storage } from '@stacks/storage/dist/esm';

import userSession from '../userSession';
import { DOT_JSON } from '../types/const';
import { cachedServerFPaths } from '../vars';

const _userSession = userSession._userSession;

const getFile = async (path, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  let content = /** @type {any} */(await storage.getFile(path, options));
  if (path.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = (path, content, options = putFileOptions) => {
  if (path.endsWith(DOT_JSON)) content = JSON.stringify(content);

  const storage = new Storage({ userSession: _userSession });
  return storage.putFile(path, content, options);
};

const deleteFile = (path, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.deleteFile(path, options);
};

const listFiles = (callback) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.listFiles(callback);
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, putFile, deleteFile, listFiles,
};

export default server;
