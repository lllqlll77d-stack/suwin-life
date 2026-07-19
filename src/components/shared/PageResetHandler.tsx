'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PageResetHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let hiddenAt = 0;

    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else {
        // Only reset if hidden for more than 1 second (actual sleep/screen off, not just tab switch)
        if (hiddenAt && Date.now() - hiddenAt > 1000) {
          if (pathname !== '/') {
            router.push('/');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [router, pathname]);

  return null;
}
