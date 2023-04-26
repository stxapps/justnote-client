import { Dirs, FileSystem } from 'react-native-file-access';

import { CD_ROOT, IMAGES, BASE64 } from '../types/const';

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

  let content; // If NotFound, return undefined.
  try {
    /* @ts-ignore */
    content = await FileSystem.readFile(fpath, encoding);
  } catch (error) {
    console.log('In localFile.getFile, error:', error);
  }

  return content;
};

const getFiles = async (fpaths, dir = Dirs.DocumentDir, encoding = BASE64) => {
  const contents = [];
  for (const fpath of fpaths) {
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
    console.log('In localFile.deleteFile, error: ', error);
  }
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (const fpath of fpaths) {
    await deleteFile(fpath, dir);
  }
};

const deleteAllFiles = async (dir = Dirs.DocumentDir) => {
  // There might be some other files too,
  //   can't just delete all files but need to specify dirs.
  const dpaths = [IMAGES];

  for (const dpath of dpaths) {
    const ddpath = deriveFPath(dpath, dir);

    const doExist = await FileSystem.exists(ddpath);
    if (!doExist) continue;

    const fnames = await FileSystem.ls(ddpath);
    for (const fname of fnames) await FileSystem.unlink(ddpath + '/' + fname);
  }
};

const listKeys = async () => {
  const keys = await FileSystem.ls(Dirs.DocumentDir);
  return keys.map(key => Dirs.DocumentDir + '/' + key);
};

const exists = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  return await FileSystem.exists(fpath);
};

const mkdir = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  await FileSystem.mkdir(fpath);
};

const localFile = {
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles, deleteAllFiles,
  listKeys, exists, mkdir,
};

export default localFile;
