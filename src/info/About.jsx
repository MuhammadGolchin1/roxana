import React from 'react';

export default function About() {
  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__copy">
          <p className="eyebrow">همراه هوشمندت توی مسیر سلامتی</p>
          <h2>پشت رکسانا یه تیم متخصصه</h2>
          <p>
            رکسانا یه شخصیت هوش مصنوعیه که یه تیم متخصص توی ساخت محتواش همراهشه.
            اینجا از تمرین و تغذیه می‌گیم و شرایط زندگی‌ت رو در نظر می‌گیریم تا بتونی عادت‌های سالم‌تری بسازی.
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
          مریم بوستانی و محمد گلچین رکسانا رو مدیریت می‌کنن.
          هر کدوم با دانش و تجربه‌شون، یه بخش از این مسیر رو جلو می‌برن.
        </p>
        <div className="about-grid">
          <article className="about-card">
            <p className="eyebrow">هدایت علمی، تمرینی و اصلاحی</p>
            <h3>مریم بوستانی</h3>
            <p>
              مریم بوستانی با مدرک کارشناسی ارشد فیزیولوژی ورزشی از دانشگاه علامه طباطبایی،
              بخش علمی، تمرینی و اصلاحی رکسانا رو هدایت می‌کنه.
            </p>
          </article>
          <article className="about-card">
            <p className="eyebrow">مدیریت و زیرساخت‌های کسب‌وکار</p>
            <h3>محمد گلچین</h3>
            <p>
              محمد گلچین با تحصیلات کامپیوتر و کارشناسی ارشد مدیریت کسب‌وکار (<bdi>MBA</bdi>)،
              مدیریت و زیرساخت‌های کسب‌وکار رکسانا رو به عهده داره.
            </p>
          </article>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-purpose-title">
        <h2 id="about-purpose-title">رکسانا چی کار می‌کنه و هدفش چیه؟</h2>
        <p>
          رکسانا اینجاست تا عادت‌های روزمره‌ت رو بهتر بشناسی و برنامه‌ای بگیری که با هدف‌هات جور باشه.
          محتوای رکسانا بیشتر برای خانم‌هاییه که می‌خوان فرم بدنشون رو بهتر کنن، وزن کم یا زیاد کنن یا محدودیت‌های حرکتی‌شون رو بررسی کنن.
        </p>
        <div className="about-mission">
          <h3>تغییری که با زندگی‌ت جور باشه</h3>
          <p>
            می‌خوایم کمکت کنیم عادت‌هایی بسازی که بتونی ادامه‌شون بدی.
            برنامه باید با حال بدنت، وقت و امکاناتت جور باشه تا توی زندگی روزمره‌ت جا بگیره.
          </p>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-start-title">
        <h2 id="about-start-title">از اینجا با رکسانا همراه شو</h2>
        <p>برای شروع، دو تا فرم توی سایت داریم. ببین کدوم به کارت میاد:</p>
        <div className="about-grid">
          <article className="about-card about-path">
            <h3>محاسبهٔ شاخص تودهٔ بدنی و ارزیابی اولیه</h3>
            <p>
              قد و وزنت رو وارد کن تا شاخص تودهٔ بدنی (<bdi>BMI</bdi>) خودت رو ببینی و بررسی اولیهٔ روش‌های دارویی کاهش وزن رو شروع کنی.
              بررسی تخصصی و تصمیم‌گیری دربارهٔ این مسیر، زیر نظر پزشک‌ها و متخصص‌های تغذیه انجام می‌شه.
            </p>
            <a className="button" href={import.meta.env.BASE_URL + 'assessment/'}>
              شروع ارزیابی وزن
            </a>
          </article>
          <article className="about-card about-path">
            <h3>ارزیابی سبک زندگی و دریافت برنامه تخصصی</h3>
            <p>
              از حال بدنت، غذاهایی که می‌خوری، فعالیت روزانه و هدف‌هات بگو.
              تیم رکسانا با توجه به شرایطت برای گرفتن برنامهٔ تمرین توی خونه یا باشگاه، برنامهٔ غذایی و حرکات اصلاحی راهنمایی‌ت می‌کنه.
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
