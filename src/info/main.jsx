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
        <p>برای پرسش دربارهٔ برنامه‌ها، پیگیری فرم‌های ارسالی یا ارتباط با تیم رکسانا، به نشانی زیر ایمیل بفرستید.</p>
        <a className="button secondary" href="mailto:Roxanaa.lifestyle@gmail.com"><bdi>Roxanaa.lifestyle@gmail.com</bdi></a>
        <p>راه‌های ارتباطی رکسانا در شبکه‌های اجتماعی هم در پایین همین صفحه قرار دارند.</p>
      </div>}
    </section>
  </SiteLayout>,
);
