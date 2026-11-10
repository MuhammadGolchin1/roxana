import React, { useEffect, useRef, useState } from 'react';

export default function HeroVideo() {
  const [posterReady, setPosterReady] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef(null);
  const poster = `${import.meta.env.BASE_URL}roxana-hero-poster.webp`;

  useEffect(() => {
    if (!posterReady) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    let timeout;

    function updatePlayback() {
      window.clearTimeout(timeout);
      setPlaying(false);
      setLoadVideo(false);
      if (!reducedMotion.matches && !connection?.saveData) {
        // Give the poster a chance to paint before downloading the video.
        timeout = window.setTimeout(() => setLoadVideo(true), 200);
      }
    }

    updatePlayback();
    reducedMotion.addEventListener('change', updatePlayback);
    connection?.addEventListener('change', updatePlayback);
    return () => {
      window.clearTimeout(timeout);
      reducedMotion.removeEventListener('change', updatePlayback);
      connection?.removeEventListener('change', updatePlayback);
    };
  }, [posterReady]);

  return (
    <><div className="hero-video" aria-hidden="true" data-playing={playing}>
      <div className="hero-video__media">
        <img
          src={poster}
          width="1600"
          height="900"
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onLoad={() => setPosterReady(true)}
          onError={() => setPosterReady(true)}
        />
        {loadVideo && !failed && (
          <video
            ref={video}
            id="hero-background-video"
            src={`${import.meta.env.BASE_URL}roxana-hero-background.mp4`}
            poster={poster}
            width="1920"
            height="1080"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => { setPlaying(false); setFailed(true); }}
          />
        )}
      </div>
    </div>
    {loadVideo && !failed && <button className="hero-video__toggle" type="button" aria-controls="hero-background-video" onClick={() => {
      if (video.current?.paused) video.current.play().catch(() => setFailed(true));
      else video.current?.pause();
    }}>{playing ? 'توقف ویدئوی پس‌زمینه' : 'پخش ویدئوی پس‌زمینه'}</button>}
    </>
  );
}
