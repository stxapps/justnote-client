// @ts-ignore
import RNBlockstackSdk from 'react-native-blockstack';
import { Dirs } from 'react-native-file-access';

const hasSession = async () => {
  const { hasSession: hs } = await RNBlockstackSdk.hasSession();
  return hs;
};

const createSession = async (config) => {
  const { loaded } = await RNBlockstackSdk.createSession(config);
  return loaded;
};

const isUserSignedIn = async () => {
  const { signedIn } = await RNBlockstackSdk.isUserSignedIn();
  return signedIn;
};

const handlePendingSignIn = async (authResponse) => {
  const { loaded } = await RNBlockstackSdk.handlePendingSignIn(authResponse);
  return loaded;
};

const signUserOut = async () => {
  const { signedOut } = await RNBlockstackSdk.signUserOut();
  return signedOut;
};

const updateUserData = async (userData) => {
  const { updated } = await RNBlockstackSdk.updateUserData(userData);
  return updated;
};

const loadUserData = async () => {
  const userData = await RNBlockstackSdk.loadUserData();
  if (!userData.appPrivateKey) userData.appPrivateKey = userData.private_key;
  return userData;
};

const putFileOptions = { encrypt: true, dir: Dirs.DocumentDir };
const putFile = async (path, content, options = putFileOptions) => {
  const { fileUrl } = await RNBlockstackSdk.putFile(path, content, options);
  return fileUrl;
};

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (path, options = getFileOptions) => {
  const result = await RNBlockstackSdk.getFile(path, options);
  if ('fileContentsEncoded' in result) return result.fileContentsEncoded;
  return result.fileContents;
};

const deleteFile = async (path, options = { wasSigned: false }) => {
  const { deleted } = await RNBlockstackSdk.deleteFile(path, options);
  return deleted;
};

const listFiles = async (callback) => {
  const { files, fileCount } = await RNBlockstackSdk.listFiles();
  files.forEach(file => callback(file));
  return fileCount;
};

const signECDSA = async (content) => {
  const userData = await loadUserData();
  const sigObj = await RNBlockstackSdk.signECDSA(userData.appPrivateKey, content);
  return sigObj;
};

const userSession = {
  hasSession, createSession,
  isUserSignedIn, handlePendingSignIn, signUserOut,
  updateUserData, loadUserData, putFile, getFile, deleteFile,
  listFiles, signECDSA,
};

export default userSession;
