import { useEffect } from 'react';
import { useRouter, ExternalPathString } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

import App from '@/components/App';

export default function Home() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (hasShareIntent) {
      router.replace('/shareintent' as ExternalPathString);
    }
  }, [hasShareIntent]);

  return <App />;
}
