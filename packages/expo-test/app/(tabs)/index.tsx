import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { useEffect } from 'react';

import RNBlockstackSdk from 'react-native-blockstack';
import MMKVStorage from 'react-native-mmkv-storage';
import FlagSecure from 'react-native-flag-secure';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {

  useEffect(() => {
    const fn = async () => {
      const { hasSession: hs } = await RNBlockstackSdk.hasSession();
      console.log('hasSession', hs);

      const config = {
        appDomain: 'https://test.com',
        scopes: ['store_write'],
        redirectUrl: 'https://test.com',
        callbackUrlScheme: 'https://test.com',
      };
      const { loaded } = await RNBlockstackSdk.createSession(config);
      console.log('loaded', loaded);

      const { signedIn } = await RNBlockstackSdk.isUserSignedIn();
      console.log('signedIn', signedIn);
    };

    fn();
  }, []);

  useEffect(() => {
    let _instance = null;
    const getInstance = () => {
      if (!_instance) _instance = new MMKVStorage.Loader().initialize();
      return _instance;
    };

    const fn = async () => {
      let res = await getInstance().getStringAsync('IS_USER_DUMMY');
      console.log('IS_USER_DUMMY', res);

      await getInstance().setStringAsync('IS_USER_DUMMY', 'ok it works');

      res = await getInstance().getStringAsync('IS_USER_DUMMY');
      console.log('IS_USER_DUMMY', res);
    };

    fn();
  }, [])

  useEffect(() => {
    if (Platform.OS === 'android') FlagSecure.activate();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
