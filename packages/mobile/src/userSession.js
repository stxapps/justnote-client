// @ts-expect-error
import RNBlockstackSdk from 'react-native-blockstack';

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

const userSession = {
  hasSession, createSession, isUserSignedIn, handlePendingSignIn, signUserOut,
  updateUserData, loadUserData,
};

export default userSession;
