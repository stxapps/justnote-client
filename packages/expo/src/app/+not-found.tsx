import { useEffect } from 'react';
import { useRouter, ExternalPathString } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

export default function NotFound() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (hasShareIntent) {
      router.replace('/shareintent' as ExternalPathString);
    } else {
      router.replace('/' as ExternalPathString);
    }
  }, [hasShareIntent]);

  return null;
}
