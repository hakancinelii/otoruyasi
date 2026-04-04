'use client';

import { useEffect } from 'react';

const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

export default function AutoRefresh() {
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
