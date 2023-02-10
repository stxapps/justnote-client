// @ts-ignore
import RNBlockstackSdk from 'react-native-blockstack';
import { Dirs } from 'react-native-file-access';

import { DOT_JSON } from '../types/const';
import { cachedServerFPaths } from '../vars';

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (fpath, options = getFileOptions) => {
  const result = await RNBlockstackSdk.getFile(fpath, options);

  let content;
  if ('fileContentsEncoded' in result) content = result.fileContentsEncoded;
  else content = result.fileContents;

  if (fpath.endsWith(DOT_JSON)) content = JSON.parse(content);
  return content;
};

const putFileOptions = { encrypt: true, dir: Dirs.DocumentDir };
const putFile = async (fpath, content, options = putFileOptions) => {
  if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);
  const { fileUrl } = await RNBlockstackSdk.putFile(fpath, content, options);
  return fileUrl;
};

const deleteFile = async (fpath, options = { wasSigned: false }) => {
  const { deleted } = await RNBlockstackSdk.deleteFile(fpath, options);
  return deleted;
};

const listFiles = async (callback) => {
  const { files, fileCount } = await RNBlockstackSdk.listFiles();
  files.forEach(file => callback(file));
  return fileCount;
};

const server = {
  cachedFPaths: cachedServerFPaths, getFile, putFile, deleteFile, listFiles,
};

export default server;
