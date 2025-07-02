import ldbApi from './localDb';

const getItem = async (key) => {
  return await ldbApi.getItem(key);
};

const setItem = async (key, item) => {
  await ldbApi.setItem(key, item);
};

const removeItem = async (key) => {
  await ldbApi.removeItem(key);
};

const localSg = { getItem, setItem, removeItem };

export default localSg;
