'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/loading/ProgressBar';
import EnterButton from '@/components/loading/EnterButton';

export default function LoadingPage() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const router = useRouter();

  const handleEnter = useCallback(() => {
    router.push('/chat');
  }, [router]);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: 'url(/图片/enter-bg-v2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Title */}
        <div className="text-center animate-fade-in">
          <h1
            className="text-3xl md:text-5xl font-bold tracking-wide mb-2"
            style={{
              fontFamily: 'var(--font-pixel)',
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.5), 3px 3px 0 rgba(0,0,0,0.2)',
              lineHeight: 1.6,
            }}
          >
            Suwin&apos;s Cosmos
          </h1>
        </div>

        {/* Progress bar */}
        <ProgressBar
          duration={3000}
          onComplete={() => setLoadingComplete(true)}
        />

        {/* Enter button */}
        <div className="h-16 flex items-center">
          <EnterButton
            visible={loadingComplete}
            onClick={handleEnter}
          />
        </div>
      </div>
    </div>
  );
}
