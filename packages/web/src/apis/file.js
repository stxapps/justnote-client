import { Dirs, FileSystem } from '../fileSystem';
import { CD_ROOT } from '../types/const';

const readFile = async (fpath, dir = Dirs.DocumentDir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }

  const content = await FileSystem.readFile(fpath);
  return content;
};

const readFiles = async (fpaths, dir = Dirs.DocumentDir) => {
  const contents = [];
  for (let fpath of fpaths) {
    const content = await readFile(fpath, dir)
    contents.push(content);
  }
  return contents;
};

const writeFile = async (fpath, content, dir = Dirs.DocumentDir) => {
  if (fpath.includes(CD_ROOT + '/')) {
    fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
    fpath = fpath.replace(CD_ROOT + '/', dir + '/');
  } else {
    fpath = dir + '/' + fpath;
  }

  await FileSystem.writeFile(fpath, content);
};

const writeFiles = async (fpaths, contents, dir = Dirs.DocumentDir) => {
  for (let i = 0; i < fpaths.length; i++) {
    await writeFile(fpaths[i], contents[i], dir);
  }
};

const deleteFiles = async (fpaths, dir = Dirs.DocumentDir) => {
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

const file = { readFile, readFiles, writeFile, writeFiles, deleteFiles, deleteAllFiles };

export default file;
