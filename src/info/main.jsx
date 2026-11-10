import React from 'react';
import { createRoot } from 'react-dom/client';
import SiteLayout from '../components/SiteLayout.jsx';
import { informationPages } from './pages.js';
import Faq from './Faq.jsx';
import Privacy from './Privacy.jsx';
import About from './About.jsx';
import '../styles.css';
import './pages.css';

const pathname = window.location.pathname.slice(import.meta.env.BASE_URL.length);
const slug = pathname.split('/').filter(Boolean)[0];
const page = informationPages.find((item) => item.slug === slug);
const pageClass = { faq: 'faq-page', privacy: 'privacy-page', about: 'about-page' }[slug] || '';

createRoot(document.getElementById('root')).render(
  <SiteLayout>
    <section className={`wrap information-page ${pageClass}`} aria-labelledby="information-title">
      <h1 id="information-title">{page?.title}</h1>
      {slug === 'about' && <About />}
      {slug === 'faq' && <Faq />}
      {slug === 'privacy' && <Privacy />}
      {slug === 'contact' && <div className="contact-content">
        <p>دربارهٔ برنامه‌ها سؤال داری یا می‌خوای فرمی رو که فرستادی پیگیری کنی؟ به آدرس زیر برامون ایمیل بفرست.</p>
        <a className="button secondary" href="mailto:Roxanaa.lifestyle@gmail.com"><bdi>Roxanaa.lifestyle@gmail.com</bdi></a>
        <p>از شبکه‌های اجتماعی هم می‌تونی باهامون در ارتباط باشی؛ لینک‌هاشون پایین همین صفحه‌ست.</p>
      </div>}
    </section>
  </SiteLayout>,
);
