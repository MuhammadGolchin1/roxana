import React from 'react';
import SiteFooter from './SiteFooter.jsx';

export default function SiteLayout({ children, assessment = false, home = false }) {
  return (
    <>
      <a className="skip" href="#main">رفتن به محتوای اصلی</a>
      <header className={`topbar${home ? ' topbar--hero' : ''}`}>
        <nav className="wrap nav" aria-label="منوی اصلی">
          <a className="brand" href="/" aria-label="رکسانا، صفحه اصلی">
            <img className="brand-mark" src="/roxana-logo.png" alt="" aria-hidden="true" />
            <span className="brand-name">رکسانا</span>
          </a>
          <div className="nav-links">
            <a className="nav-link--about" href="/#about">معرفی رکسانا</a>
            <a href="/assessment/" aria-current={assessment ? 'page' : undefined}>ارزیابی وزن</a>
            <a href="/questionnaire/">ارزیابی سبک زندگی و دریافت برنامه</a>
          </div>
          <a className="button secondary" href="/#start">شروع ارزیابی</a>
        </nav>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
