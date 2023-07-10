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
    /* @ts-expect-error */
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

  /* @ts-expect-error */
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

    await FileSystem.unlink(ddpath);
  }
};

const exists = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  return await FileSystem.exists(fpath);
};

const mkdir = async (fpath, dir = Dirs.DocumentDir) => {
  fpath = deriveFPath(fpath, dir);
  await FileSystem.mkdir(fpath);
};

const _getFilePaths = async (dpath = Dirs.DocumentDir) => {
  const fpaths = [];

  const fnames = await FileSystem.ls(dpath);
  for (const fname of fnames) {
    const fpath = `${dpath}/${fname}`;
    const isDir = await FileSystem.isDir(fpath);

    if (isDir) {
      const _fpaths = await _getFilePaths(fpath);
      fpaths.push(..._fpaths);
      continue;
    }
    fpaths.push(fpath);
  }

  return fpaths;
};

const getStaticFPaths = async () => {
  const keys = await _getFilePaths();

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
  getFile, getFiles, putFile, putFiles, deleteFile, deleteFiles, deleteAllFiles,
  exists, mkdir, getStaticFPaths,
};

export default localFile;
