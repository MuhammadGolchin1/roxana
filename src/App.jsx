import React from 'react';
import SiteLayout from './components/SiteLayout.jsx';

export default function App() {
  return (
    <SiteLayout>
      <section className="wrap hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">رکسانا · سبک زندگی و تناسب اندام</p>
          <h1 id="hero-title">نسخه بهتری از خودت رو زندگی کن!</h1>
          <p>توی پیج اینستاگرام رکسانا، تمرین‌های کوتاه در خانه، غذاهای ساده و سالم و آموزش حرکات اصلاحی رو پیدا می‌کنی. اگر می‌خوای بدونی از نظر BMI در محدوده بررسی آمپول کاهش وزن هستی، از ارزیابی اولیه شروع کن.</p>
        </div>
        <figure className="poster" aria-label="رکسانا، سبک زندگی و تناسب اندام">
          <img className="poster-art" src="/roxana-portrait-reference-botanical.png" alt="رکسانا با لباس ورزشی فیروزه‌ای در کنار موج‌ها و برگ‌های آبی" fetchPriority="high" />
        </figure>
      </section>

      <section className="topics" id="about" aria-labelledby="about-title">
        <div className="wrap">
          <div className="section-heading">
            <p className="eyebrow">محتوای رکسانا</p>
            <h2 id="about-title">توی رکسانا چی پیدا می‌کنی؟</h2>
          </div>
          <div className="topic-grid">
            <article className="topic">
              <span className="topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16c0 5-3 8-8 8s-8-3-8-8Zm4 11h8M9 7c0-2 2-2 2-4m3 4c0-2 2-2 2-4"/></svg></span>
              <div><h3>غذاهای ساده و سالم</h3><p>از صبحانه پروتئینی تا میان‌وعده سیرکننده، با مواد اولیه‌ای که راحت پیدا می‌شن.</p></div>
            </article>
            <article className="topic">
              <span className="topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7v10m10-10v10M4 9v6m16-6v6M7 12h10M2 12h2m16 0h2"/></svg></span>
              <div><h3>تمرین و چالش در خانه</h3><p>تمرین‌های کوتاه و ویدیوهای همراهی برای روزهایی که وقت یا امکان رفتن به باشگاه نداری.</p></div>
            </article>
            <article className="topic">
              <span className="topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><path d="m4 9 8 2 8-2m-8 2v5m0 0-4 5m4-5 4 5"/></svg></span>
              <div><h3>حرکات اصلاحی</h3><p>آموزش حرکت و وضعیت بدن، با تمرکز روی گودی کمر، قوز پشت و سلامت مفاصل.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="wrap services" id="start" aria-labelledby="services-title">
        <h2 id="services-title">از کجا شروع کنم ؟</h2>
        <div className="service-grid">
          <a className="service-card" href="/assessment/" aria-labelledby="assessment-link-title">
            <span className="service-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8m-8 5h2m4 0h2m-8 4h2m4 0h2"/></svg>
            </span>
            <div>
              <h3 id="assessment-link-title">ارزیابی برای آمپول لاغری</h3>
              <p>با وارد کردن قد و وزن، BMI خودت رو ببین و ارزیابی اولیه برای بررسی آمپول لاغری رو انجام بده و از پزشکان و متخصصان مشورت بگیر.</p>
            </div>
          </a>
          <a className="service-card" href="/questionnaire/" aria-labelledby="coaching-link-title">
            <span className="service-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M4 12h4l2-4 4 8 2-4h4"/></svg>
            </span>
            <div>
              <h3 id="coaching-link-title">تا عید به تناسب اندام برس!</h3>
              <p>از وضعیت سلامت، تغذیه و فعالیتت بگو تا تیم رکسانا برای شروع همراهی و راهنمایی متناسب با شرایطت باهات آشنا بشه.</p>
            </div>
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
