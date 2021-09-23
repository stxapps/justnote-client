import { Dirs, FileSystem } from 'react-native-file-access';

import { CD_ROOT, BASE64 } from '../types/const';

const deriveFPath = (fpath, dir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }
  return fpath;
};

const getFile = async (fpath, dir = Dirs.DocumentDir, encoding = BASE64) => {
  fpath = deriveFPath(fpath, dir);

  /* @ts-ignore */
  const content = await FileSystem.readFile(fpath, encoding);
  return content;
};

const getFiles = async (fpaths, dir = Dirs.DocumentDir, encoding = BASE64) => {
  const contents = [];
  for (let fpath of fpaths) {
    const content = await getFile(fpath, dir, encoding);
    contents.push(content);
  }
  return { fpaths, contents };
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir, encoding = BASE64) => {
  fpath = deriveFPath(fpath, dir);

  if (encoding === BASE64) {
    const i = content.indexOf(',');
    if (i >= 0) content = content.slice(i + 1);
  }

  /* @ts-ignore */
  await FileSystem.writeFile(fpath, content, encoding);
};

const putFiles = async (fpaths, contents, dir = Dirs.DocumentDir, encoding = BASE64) => {
  for (let i = 0; i < fpaths.length; i++) {
    await putFile(fpaths[i], contents[i], dir, encoding);
  }
};

const deleteFile = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);

  try {
    await FileSystem.unlink(fpath);
  } catch (error) {
    // BUG ALERT
    // Treat not found error as not an error as local data might be out-dated.
    //   i.e. user tries to delete a not-existing file, it's ok.
    // Anyway, if the file should be there, this will hide the real error!
    console.log('fileApi.deleteFile error: ', error);
  }
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (let fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async (dpath, dir = Dirs.DocumentDir) => {
  dpath = deriveFPath(dpath, dir);

  const fnames = await FileSystem.ls(dpath);
  for (const fname of fnames) await FileSystem.unlink(dpath + '/' + fname);
};

const exists = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  return await FileSystem.exists(fpath);
};

const mkdir = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  await FileSystem.mkdir(fpath);
};

const file = {
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles, deleteAllFiles,
  exists, mkdir,
};

export default file;
