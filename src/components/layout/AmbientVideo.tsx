'use client';

import { useEffect, useRef, useState } from 'react';

const VIDEO_SOURCE = '/media/cosmos-background.mp4';

export default function AmbientVideo({ subdued = false }: { subdued?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (reducedMotion.matches || document.hidden || userPaused.current) {
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = VIDEO_SOURCE;
      void video.play().catch(() => { /* Keep the poster when autoplay is unavailable. */ });
    };
    syncPlayback();
    reducedMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      video.pause();
      reducedMotion.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      userPaused.current = true;
      video.pause();
    } else {
      userPaused.current = false;
      setUnavailable(false);
      if (!video.getAttribute('src')) video.src = VIDEO_SOURCE;
      void video.play().catch(() => setUnavailable(true));
    }
  };

  return (
    <>
      <div className={`ambient-background${subdued ? ' ambient-subdued' : ''}`} aria-hidden="true">
        <video ref={videoRef} className="ambient-video" loop muted playsInline preload="none"
          poster="/media/cosmos-poster.jpg" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => { setPlaying(false); setUnavailable(true); }} />
        <div className="ambient-vignette" />
      </div>
      <button className="motion-control" onClick={togglePlayback} aria-label={playing ? '暂停背景动画' : '播放背景动画'} aria-pressed={playing}>
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>
        {unavailable ? '重试动画' : playing ? 'PAUSE' : 'PLAY'}
      </button>
    </>
  );
}
