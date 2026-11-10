import React from 'react';
import SiteFooter from './SiteFooter.jsx';

export default function SiteLayout({ children, assessment = false, home = false }) {
  return (
    <>
      <a className="skip" href="#main">رفتن به محتوای اصلی</a>
      <header className={`topbar${home ? ' topbar--hero' : ''}`}>
        <nav className="wrap nav" aria-label="منوی اصلی">
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="رکسانا، صفحهٔ اصلی">
            <img className="brand-mark" src={import.meta.env.BASE_URL + "roxana-logo.png"} width="72" height="72" alt="" aria-hidden="true" />
            <span className="brand-name">رکسانا</span>
          </a>
          <div className="nav-links">
            <a className="nav-link--about" href={import.meta.env.BASE_URL + "#about"}>معرفی رکسانا</a>
            <a href={import.meta.env.BASE_URL + "assessment/"} aria-current={assessment ? 'page' : undefined}>ارزیابی وزن</a>
            <a href={import.meta.env.BASE_URL + "questionnaire/"}>ارزیابی سبک زندگی و دریافت برنامه</a>
          </div>
          <a className="button secondary" href={import.meta.env.BASE_URL + "#start"}>شروع ارزیابی</a>
        </nav>
      </header>
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
