import { FileSystem } from '../fileSystem';
import { CD_ROOT } from '../types/const';

const readFiles = async (fpaths, dir) => {
  const contents = [];
  for (let fpath of fpaths) {
    if (fpath.includes(CD_ROOT + '/')) {
      fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
      fpath = fpath.replace(CD_ROOT + '/', dir + '/');
    } else {
      fpath = dir + '/' + fpath;
    }

    const content = await FileSystem.readFile(fpath);
    contents.push(content);
  }
  return contents;
};

const writeFiles = async (fpaths, contents) => {
  for (let i = 0; i < fpaths.length; i++) {
    await FileSystem.writeFile(fpaths[i], contents[i]);
  }
};

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
  await FileSystem.unlinkAll();
};

const file = { readFiles, writeFiles, deleteFiles, deleteAllFiles };

export default file;
