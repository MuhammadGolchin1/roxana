import React from 'react';

export default function SiteLayout({ children, assessment = false }) {
  return (
    <>
      <a className="skip" href="#main">رفتن به محتوای اصلی</a>
      <header className="topbar">
        <nav className="wrap nav" aria-label="منوی اصلی">
          <a className="brand" href="/" aria-label="رکسانا، صفحه اصلی">
            <img className="brand-mark" src="/roxana-logo.png" alt="" aria-hidden="true" />
            <span className="brand-name">رکسانا</span>
          </a>
          <div className="nav-links"><a href="/#about">معرفی رکسانا</a><a href="/assessment/" aria-current={assessment ? 'page' : undefined}>ارزیابی وزن</a></div>
          <a className="button secondary" href="/#start">شروع ارزیابی</a>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p className="small"><strong>رکسانا</strong> · سبک زندگی و تناسب اندام</p>
          <a href="#top">بازگشت به بالای صفحه ↑</a>
        </div>
      </footer>
    </>
  );
}
