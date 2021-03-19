import userSession from '../userSession';
import { SETTINGS_FNAME } from '../types/const';

const listFPaths = async () => {

  const noteFPaths = [];
  let settingsFPath = null;

  await userSession.listFiles((fpath) => {
    if (fpath.startsWith('notes')) {
      noteFPaths.push(fpath);
    } else if (fpath === SETTINGS_FNAME) {
      settingsFPath = fpath;
    } else {
      throw new Error(`Invalid file path: ${fpath}`);
    }
  });

  return { noteFPaths, settingsFPath };
};

const server = { listFPaths };

export default server;
