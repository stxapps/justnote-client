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

const signUp = async () => {
  return await RNBlockstackSdk.signUp();
};

const signIn = async () => {
  return await RNBlockstackSdk.signIn();
};

const handlePendingSignIn = async (authResponse) => {
  const { loaded } = await RNBlockstackSdk.handlePendingSignIn(authResponse);
  return loaded;
};

const signUserOut = async () => {
  const { signedOut } = await RNBlockstackSdk.signUserOut();
  return signedOut;
};

const loadUserData = async () => {
  return await RNBlockstackSdk.loadUserData();
};

const putFileOptions = { encrypt: true, dir: Dirs.DocumentDir };
const putFile = async (path, content, options = putFileOptions) => {
  const { fileUrl } = await RNBlockstackSdk.putFile(path, content, options);
  return fileUrl;
};

const getFileOptions = { decrypt: true, dir: Dirs.DocumentDir };
const getFile = async (path, options = getFileOptions) => {
  const result = await RNBlockstackSdk.getFile(path, options);
  return result.fileContents || result.fileContentsEncoded;
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

export default {
  hasSession, createSession,
  isUserSignedIn, signUp, signIn, handlePendingSignIn, signUserOut, loadUserData,
  putFile, getFile, deleteFile, listFiles,
};
