import MMKVStorage from "react-native-mmkv-storage";

let _instance = null;

const getInstance = () => {
  if (!_instance) _instance = new MMKVStorage.Loader().initialize();
  return _instance;
};

const putFile = async (path, content) => {
  if (path.endsWith('.json')) await getInstance().setMapAsync(path, content);
  else await getInstance().setStringAsync(path, content);

  return path;
};

const getFile = async (path) => {
  try {
    if (path.endsWith('.json')) return await getInstance().getMapAsync(path);
    return await getInstance().getStringAsync(path);
  } catch (e) {
    console.log('getFile error: ', e);
    return null;
  }
};

const deleteFile = async (path) => {
  await getInstance().removeItem(path);
  return true;
};

const listFiles = async (callback) => {
  const files = await getInstance().indexer.getKeys();
  files.forEach(file => {
    if (['default', 'boolIndex'].includes(file)) return;
    callback(file)
  });
  return files.length;
};

export default {
  putFile, getFile, deleteFile, listFiles,
};
