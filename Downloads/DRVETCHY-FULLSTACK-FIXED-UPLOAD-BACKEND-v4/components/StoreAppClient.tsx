'use client';

import dynamic from 'next/dynamic';

const StoreApp = dynamic(() => import('./StoreApp'), {
  ssr: false,
});

export default function StoreAppClient() {
  return <StoreApp />;
}