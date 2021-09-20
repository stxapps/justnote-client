import { Dirs, FileSystem } from '../fileSystem';
import { CD_ROOT } from '../types/const';

const getFile = async (fpath, dir = Dirs.DocumentDir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }

  const content = await FileSystem.readFile(fpath);
  return content;
};

const getFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  const contents = [];
  for (let fpath of fpaths) {
    const content = await getFile(fpath, dir);
    contents.push(content);
  }
  return { fpaths, contents };
};

const putFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }

  await FileSystem.writeFile(fpath, content);
};

const putFiles = async (fpaths, contents, dir = Dirs.DocumentDir) => {
  for (let i = 0; i < fpaths.length; i++) {
    await putFile(fpaths[i], contents[i], dir);
  }
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  for (let fpath of fpaths) {
    if (fpath.includes(CD_ROOT + '/')) {
      fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
      fpath = fpath.replace(CD_ROOT + '/', dir + '/');
    } else {
      fpath = dir + '/' + fpath;
    }

    try {
      await FileSystem.unlink(fpath);
    } catch (error) {
      // BUG ALERT
      // Treat not found error as not an error as local data might be out-dated.
      //   i.e. user tries to delete a not-existing file, it's ok.
      // Anyway, if the file should be there, this will hide the real error!
      console.log('fileApi.deleteFiles error: ', error);
    }
  }
};

const deleteAllFiles = async () => {
  await FileSystem.unlinkAll();
};

const file = { getFile, getFiles, putFile, putFiles, deleteFiles, deleteAllFiles };

export default file;
