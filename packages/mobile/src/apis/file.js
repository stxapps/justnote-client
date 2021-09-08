import { Dirs, FileSystem } from 'react-native-file-access';

import { CD_ROOT } from '../types/const';

const deleteFiles = async (fpaths, dir) => {
  let _e;
  for (let fpath of fpaths) {
    if (fpath.includes(CD_ROOT + '/')) {
      fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
      fpath = fpath.replace(CD_ROOT + '/', dir + '/');
    } else {
      fpath = dir + '/' + fpath;
    }

    try {
      await FileSystem.unlink(fpath);
    } catch (e) {
      console.log(`apis/file.deleteFiles: with fpath: ${fpath}, error: `, e);
      _e = e;
    }
  }
  if (_e) throw _e;
};

const deleteAllFiles = async () => {
  const fpaths = await FileSystem.ls(Dirs.DocumentDir);
  for (const fpath of fpaths) await FileSystem.unlink(fpath);
};

const file = { deleteFiles, deleteAllFiles };

export default file;
