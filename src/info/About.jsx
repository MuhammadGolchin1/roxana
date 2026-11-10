import React from 'react';

export default function About() {
  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__copy">
          <p className="eyebrow">همراه هوشمند شما در مسیر سلامتی</p>
          <h2>رکسانا؛ همراهی با پشتوانهٔ یک تیم متخصص</h2>
          <p>
            رکسانا یک شخصیت هوش مصنوعی است که محتوای آن با همراهی یک تیم متخصص تهیه می‌شود.
            در رکسانا، آموزش تمرین و تغذیه با شناخت شرایط زندگی شما پیوند می‌خورد تا بتوانید عادت‌های سالم‌تری بسازید.
          </p>
        </div>
        <img
          className="about-intro__portrait"
          src={import.meta.env.BASE_URL + 'roxana-portrait-reference-botanical.png'}
          alt="رکسانا، کاراکتر هوش مصنوعی با لباس ورزشی فیروزه‌ای و برگ‌های تزئینی"
          width="1383"
          height="1137"
          decoding="async"
        />
      </div>

      <section className="about-section" aria-labelledby="about-team-title">
        <h2 id="about-team-title">آدم‌های پشت رکسانا</h2>
        <p>
          مریم بوستانی و محمد گلچین رکسانا را مدیریت می‌کنند.
          هر کدام با دانش و تجربهٔ خود، بخشی از این مسیر مشترک را پیش می‌برند.
        </p>
        <div className="about-grid">
          <article className="about-card">
            <p className="eyebrow">هدایت علمی، تمرینی و اصلاحی</p>
            <h3>مریم بوستانی</h3>
            <p>
              مریم بوستانی با مدرک کارشناسی ارشد فیزیولوژی ورزشی از دانشگاه علامه طباطبایی،
              بخش علمی، تمرینی و اصلاحی رکسانا را هدایت می‌کند.
            </p>
          </article>
          <article className="about-card">
            <p className="eyebrow">مدیریت و زیرساخت‌های کسب‌وکار</p>
            <h3>محمد گلچین</h3>
            <p>
              محمد گلچین با تحصیلات کامپیوتر و کارشناسی ارشد مدیریت کسب‌وکار (<bdi>MBA</bdi>)،
              مدیریت و زیرساخت‌های کسب‌وکار رکسانا را بر عهده دارد.
            </p>
          </article>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-purpose-title">
        <h2 id="about-purpose-title">رکسانا چه کار می‌کند و هدفش چیست؟</h2>
        <p>
          رکسانا برای شناخت عادت‌های روزانه و دریافت برنامهٔ متناسب با هدف‌های بدنی شما شکل گرفته است.
          محتوای آن به‌ویژه برای بانوانی تهیه می‌شود که به دنبال بهبود فرم بدن، کاهش یا افزایش وزن و بررسی محدودیت‌های حرکتی خود هستند.
        </p>
        <div className="about-mission">
          <h3>تغییری که با زندگی شما سازگار باشد</h3>
          <p>
            هدف ما کمک به ساختن عادت‌هایی است که بتوانید ادامه دهید.
            برنامه باید با وضعیت سلامت، وقت و امکانات شما هماهنگ باشد تا در زندگی روزمره جای بگیرد.
          </p>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-start-title">
        <h2 id="about-start-title">مسیر همراهی شما با رکسانا</h2>
        <p>برای شروع، می‌توانید از دو فرم اختصاصی سایت استفاده کنید:</p>
        <div className="about-grid">
          <article className="about-card about-path">
            <h3>محاسبهٔ شاخص تودهٔ بدنی و ارزیابی اولیه</h3>
            <p>
              با وارد کردن قد و وزن، شاخص تودهٔ بدنی (<bdi>BMI</bdi>) خود را ببینید و ارزیابی اولیه
              را برای بررسی روش‌های دارویی کاهش وزن انجام دهید. بررسی تخصصی و تصمیم‌گیری درباره
              این مسیر، تحت نظر پزشکان و متخصصان تغذیه انجام می‌شود.
            </p>
            <a className="button" href={import.meta.env.BASE_URL + 'assessment/'}>
              شروع ارزیابی وزن
            </a>
          </article>
          <article className="about-card about-path">
            <h3>ارزیابی سبک زندگی و دریافت برنامه تخصصی</h3>
            <p>
              از وضعیت سلامت، تغذیه، فعالیت روزانه و هدف‌هایتان بگویید تا تیم رکسانا برای
              دریافت برنامه تخصصی تمرین در خانه یا باشگاه، رژیم غذایی و حرکات اصلاحی،
              متناسب با شرایط شما راهنمایی‌تان کند.
            </p>
            <a className="button secondary" href={import.meta.env.BASE_URL + 'questionnaire/'}>
              شروع ارزیابی سبک زندگی
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
