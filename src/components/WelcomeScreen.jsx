import React, { useEffect, useState } from 'react';
import './welcome-screen.css';

const INTRO_DURATION_MS = 2000;

export default function WelcomeScreen({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timeout = window.setTimeout(() => setIsLoading(false), INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <div className="welcome-screen" role="status" dir="rtl" style={{ '--intro-duration': `${INTRO_DURATION_MS}ms` }}>
          <div className="welcome-screen__content">
            <div className="welcome-screen__art" aria-hidden="true">
              <span className="welcome-screen__halo" />
              <svg className="welcome-screen__logo" viewBox="192 64 912 1176" fill="none">
                {/* Frame the text-free symbol with a small transparent margin. */}
                <image href="/roxana-logo.png" width="1254" height="1254" />
              </svg>
            </div>
            <p className="welcome-screen__message">حال خوبت از اینجا شروع می‌شه</p>
            <span className="welcome-screen__dots" aria-hidden="true"><span /><span /><span /></span>
          </div>
        </div>
      )}
      <div inert={isLoading} aria-hidden={isLoading || undefined}>
        {children}
      </div>
    </>
  );
}
