import React from 'react';
import { informationPages } from '../info/pages.js';
import './site-footer.css';

const socialNetworks = [
  { name: 'تلگرام', icon: 'telegram.png', href: 'https://t.me/Roxanaa_Lifestyle' },
  { name: 'اینستاگرام', icon: 'instagram.png', href: 'https://www.instagram.com/Roxana.lifestyle/' },
  { name: 'واتساپ', icon: 'whatsapp.png', href: 'https://wa.me/989960764003' },
  { name: 'بله', icon: 'bale.png', href: 'https://ble.ir/Roxana_Lifestyle' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" dir="rtl">
      <svg className="site-footer__icon-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="bale-icon-outline" clipPathUnits="objectBoundingBox">
            <path d="M .002 .06 C .002 .011 .047 -.021 .092 .01 L .208 .096 C .29 .035 .392 .002 .5 .002 C .775 .002 .998 .225 .998 .5 C .998 .775 .775 .998 .5 .998 C .225 .998 .002 .775 .002 .5 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <a className="site-footer__brand" href={import.meta.env.BASE_URL} aria-label="رکسانا، صفحه اصلی">
              <img src={import.meta.env.BASE_URL + "roxana-logo.png"} width="64" height="64" alt="" />
              <span><strong>رکسانا</strong><span>سبک زندگی و تناسب اندام</span></span>
            </a>
            <p className="site-footer__tagline">حال خوبت از اینجا شروع می‌شه</p>
          </div>

          <nav className="site-footer__nav" aria-label="لینک‌های فوتر">
            <h2 className="site-footer__heading">همراه رکسانا</h2>
            <ul>
              {informationPages.filter(({ slug }) => slug !== 'contact').map(({ slug, title }) => (
                <li key={slug}><a href={`${import.meta.env.BASE_URL}${slug}/`}>{title}</a></li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__contact">
            <h2 className="site-footer__heading">در ارتباط باشیم</h2>
            <a className="site-footer__email" href="mailto:Roxanaa.lifestyle@gmail.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
              <bdi>Roxanaa.lifestyle@gmail.com</bdi>
            </a>
            <ul className="site-footer__socials" aria-label="شبکه‌های اجتماعی رکسانا">
              {socialNetworks.map(({ name, icon, href }) => (
                <li key={icon}>
                  <a className="site-footer__social" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} رکسانا (در پنجره جدید)`}>
                    <img src={`${import.meta.env.BASE_URL}social/${icon}`} width="32" height="32" alt="" loading="lazy" decoding="async" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© رکسانا؛ تمامی حقوق محفوظ است.</p>
          <a href="#top">بازگشت به بالای صفحه <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
