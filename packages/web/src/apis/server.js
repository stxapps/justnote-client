import { Storage } from '@stacks/storage/dist/esm';

import userSession from '../userSession';
import { DOT_JSON, N_NOTES } from '../types/const';
import {
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
} from '../utils';
import { cachedServerFPaths } from '../vars';

const _userSession = userSession._userSession;

const getFile = async (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  let content = /** @type {any} */(await storage.getFile(fpath, options));
  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const getFiles = async (_fpaths, dangerouslyIgnoreError = false) => {

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let i = 0, j = _fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = _fpaths.slice(i, i + N_NOTES);
    const responses = await batchGetFileWithRetry(
      getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    fpaths.push(...responses.map(({ fpath }) => fpath));
    contents.push(...responses.map(({ content }) => content));
  }

  return { fpaths, contents };
};

const putFileOptions = { dangerouslyIgnoreEtag: true };
const putFile = (fpath, content, options = putFileOptions) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

  const storage = new Storage({ userSession: _userSession });
  return storage.putFile(fpath, content, options);
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _contents = contents.slice(i, i + N_NOTES);
    await batchPutFileWithRetry(putFile, cachedServerFPaths, _fpaths, _contents, 0);
  }
};

const deleteFile = (fpath, options = {}) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.deleteFile(fpath, options);
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    await batchDeleteFileWithRetry(deleteFile, cachedServerFPaths, _fpaths, 0);
  }
};

const listFiles = (callback) => {
  const storage = new Storage({ userSession: _userSession });
  return storage.listFiles(callback);
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, getFiles, putFile, putFiles, deleteFile,
  deleteFiles, listFiles,
};

export default server;
