import { useEffect } from 'react';
import { useRouter, ExternalPathString } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';

import Share from '@/components/Share';

export default function ShareIntent() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) {
      router.replace('/' as ExternalPathString);
    }
  }, [hasShareIntent]);

  return <Share />;
}
