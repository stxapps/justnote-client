const getItem = async (key) => {
  const item = localStorage.getItem(key);
  return item;
};

const setItem = async (key, item) => {
  localStorage.setItem(key, item);
};

const removeItem = async (key) => {
  localStorage.removeItem(key);
};

const localSg = { getItem, setItem, removeItem };

export default localSg;
