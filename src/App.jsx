import React, { useEffect, useRef, useState } from 'react';
import { assess, healthOptions, validateContact } from '../lib/assessment.js';

const sendErrors = {
  not_configured: 'تنظیمات ارسال به بله موقع ساخت سایت پیدا نشد. مقدارهای BALE را تنظیم و سایت را دوباره build کن.',
};

export default function App() {
  const [result, setResult] = useState(null);
  const [measurementErrors, setMeasurementErrors] = useState({});
  const [otherHealth, setOtherHealth] = useState(false);
  const [channel, setChannel] = useState('phone');
  const [contactErrors, setContactErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [sendError, setSendError] = useState('');
  const measurementForm = useRef(null);
  const resultHeading = useRef(null);
  const confirmationHeading = useRef(null);
  const editing = useRef(false);
  const sending = useRef(false);

  useEffect(() => {
    if (result) resultHeading.current?.focus();
    else if (editing.current) {
      editing.current = false;
      measurementForm.current?.elements.height.focus();
    }
  }, [result]);

  useEffect(() => {
    if (status === 'submitted' || status === 'unknown') confirmationHeading.current?.focus();
  }, [status]);

  function measure(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const height = values.get('height');
    const weight = values.get('weight');
    const assessment = assess(height, weight);
    const errors = {};
    if (assessment.invalidHeight) errors.height = 'قد رو بین ۷۰ و ۲۷۰ سانتی‌متر، با حداکثر دو رقم اعشار وارد کن.';
    if (assessment.invalidWeight) errors.weight = 'وزن رو بین ۱۵ و ۶۵۰ کیلوگرم، با حداکثر دو رقم اعشار وارد کن.';
    setMeasurementErrors(errors);

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.elements.namedItem(firstError)?.focus();
      return;
    }

    const health = values.getAll('health').map(String);
    const healthDetail = String(values.get('healthDetail') ?? '').trim();
    setResult({
      ...assessment,
      height,
      weight,
      health,
      healthDetail,
      hasHealthContext: health.length > 0 || Boolean(healthDetail),
    });
  }

  function editMeasurements() {
    editing.current = true;
    setResult(null);
    setChannel('phone');
    setContactErrors({});
    setSendError('');
    setStatus('idle');
  }

  async function sendContact(event) {
    event.preventDefault();
    if (sending.current || !result || status === 'submitted' || status === 'unknown') return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const contact = validateContact(values.get('name'), channel, values.get('contact'));
    const errors = {};
    if (!contact.name) errors.name = 'اسمت رو با حروف وارد کن.';
    if (!contact.value) {
      errors.contact = channel === 'phone'
        ? 'شماره موبایل رو مثل ۰۹۱۲۳۴۵۶۷۸۹ وارد کن.'
        : 'آیدی اینستاگرامت رو مثل ⁦@username⁩ وارد کن.';
    }
    setContactErrors(errors);
    setSendError('');

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.elements.namedItem(firstError)?.focus();
      return;
    }

    const token = import.meta.env.VITE_BALE_BOT_TOKEN?.trim();
    const chatIds = [
      import.meta.env.VITE_BALE_CHAT_ID?.trim(),
      import.meta.env.VITE_BALE_CHAT_ID2?.trim(),
    ];
    if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token) ||
        chatIds.some((id) => !id || !/^-?\d+$/.test(id)) ||
        new Set(chatIds).size !== chatIds.length) {
      setSendError(sendErrors.not_configured);
      return;
    }

    sending.current = true;
    setStatus('sending');
    try {
      const channelLabel = channel === 'phone' ? 'موبایل' : 'اینستاگرام';
      const healthLabels = result.health.map((item) => (
        item === 'other'
          ? `مورد دیگه${result.healthDetail.trim() ? `: ${result.healthDetail.trim()}` : ''}`
          : item
      ));
      const message = [
        'درخواست پیگیری روکسانا',
        'نام: ' + contact.name,
        channelLabel + ': ' + contact.value,
        'BMI: ' + result.display,
        'مشکلات سلامتی: ' + (healthLabels.length ? healthLabels.join('، ') : 'ذکر نشده'),
        `نتیجه: ${result.inRange ? 'در محدوده بررسی اولیه' : 'خارج از محدوده بررسی اولیه'}`,
      ].join('\n');
      const deliveries = await Promise.allSettled(chatIds.map((id) => fetch(
        `https://tapi.bale.ai/bot${token}/sendMessage`,
        {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams({ chat_id: id, text: message }),
          signal: AbortSignal.timeout(8_000),
        },
      )));
      setStatus(deliveries.every((delivery) => delivery.status === 'fulfilled') ? 'submitted' : 'unknown');
    } catch {
      setStatus('unknown');
    } finally {
      sending.current = false;
    }
  }

  const isSending = status === 'sending';
  const byPhone = channel === 'phone';
  const resultContext = result?.inRange
    ? 'تصمیم درباره مناسب‌بودن آمپول و شروع درمان با پزشکه.'
    : result?.bmi >= 27
      ? 'از BMI ۲۷ به بالا، در صورت وجود بعضی مشکلات مرتبط با وزن، پزشک می‌تونه دارو رو بررسی کنه.'
      : 'اگر برای مدیریت وزنت سؤال داری، می‌تونی درباره گزینه‌های مناسب با پزشک صحبت کنی.';

  return (
    <>
      <a className="skip" href="#main">رفتن به محتوای اصلی</a>
      <header className="topbar">
        <nav className="wrap nav" aria-label="منوی اصلی">
          <a className="brand" href="#top" aria-label="روکسانا، ابتدای صفحه">
            <img className="brand-mark" src="/roxana-logo.png" alt="" aria-hidden="true" />
            <span className="brand-name">روکسانا</span>
          </a>
          <div className="nav-links"><a href="#about">معرفی روکسانا</a><a href="#assessment">ارزیابی وزن</a></div>
          <a className="button secondary" href="#assessment">شروع ارزیابی</a>
        </nav>
      </header>

      <main id="main">
        <section className="wrap hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">روکسانا · سبک زندگی و تناسب اندام</p>
            <h1 id="hero-title">با بدن خودت <span>همراه‌تر باش</span></h1>
            <p>توی پیج اینستاگرام روکسانا، تمرین‌های کوتاه در خانه، غذاهای ساده و سالم و آموزش حرکات اصلاحی رو پیدا می‌کنی. اگر می‌خوای بدونی از نظر BMI در محدوده بررسی آمپول کاهش وزن هستی، از ارزیابی اولیه شروع کن.</p>
            <div className="hero-actions">
              <a className="button" href="#assessment">ارزیابی اولیه برای آمپول لاغری <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg></a>
            </div>
            <p className="small">نمایش فوری BMI · ارزیابی اولیه</p>
          </div>
          <figure className="poster" aria-label="طرح مفهومی تصویر لندینگ روکسانا، حرکت و سبک زندگی">
            <div className="poster-grid" aria-hidden="true"></div>
            <span className="poster-wordmark" dir="ltr" aria-hidden="true">ROXANA / STUDIO</span>
            <svg className="poster-art" viewBox="0 0 500 395" fill="none" aria-hidden="true">
              <circle cx="255" cy="194" r="126" fill="#E7ECE5" stroke="#8FA38A"/>
              <circle cx="255" cy="194" r="100" stroke="#B9C8B5" strokeDasharray="4 7"/>
              <path d="M90 310h320M98 295h42m223 0h43" stroke="#AAB9A6" strokeLinecap="round"/>
              <ellipse cx="258" cy="304" rx="117" ry="15" fill="#D9E2D6"/>
              <path d="M257 149c-33-9-63 8-91 28-21 15-41 17-60 13m151-41c28 3 55 5 75-7 20-12 30-32 45-42" stroke="#6C8068" strokeWidth="10" strokeLinecap="round"/>
              <circle cx="264" cy="106" r="21" fill="#FAF8F5" stroke="#6C8068" strokeWidth="6"/>
              <path d="M260 148c-3 33-20 53-41 72l36 20 33-28c-14-22-19-44-16-63" fill="#F6D5C9" stroke="#6C8068" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M229 227c-22 15-47 27-64 49l-17 24m108-60 39 32 54 28" stroke="#6C8068" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M132 111h18m-9-9v18m233 75h24m-12-12v24" stroke="#8FA38A" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="162" cy="132" r="3" fill="#8FA38A"/>
              <circle cx="366" cy="220" r="3" fill="#8FA38A"/>
            </svg>
            <figcaption className="poster-caption"><span className="poster-tag">حرکت، تغذیه و مراقبت از بدن</span><span>روکسانا</span></figcaption>
          </figure>
        </section>

        <section className="wrap topics" id="about" aria-labelledby="about-title">
          <div className="section-heading">
            <p className="eyebrow">محتوای روکسانا</p>
            <h2 id="about-title">توی روکسانا چی پیدا می‌کنی؟</h2>
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
        </section>

        <section className="assessment" id="assessment" aria-labelledby="assessment-title">
          <div className="wrap assessment-grid">
            <div className="assessment-aside">
              <p className="eyebrow">ارزیابی اولیه · محاسبه BMI</p>
              <h2 id="assessment-title">آیا BMI من در محدوده بررسی آمپول لاغریه؟</h2>
              <p>قد و وزنت رو وارد کن و اگر دوست داشتی، مشکلات سلامتت رو هم مشخص کن. نتیجه بر اساس شاخص توده بدنی (BMI) نمایش داده می‌شه.</p>
              <ol className="steps" aria-label="مراحل ارزیابی">
                <li aria-current={result ? undefined : 'step'}><span aria-hidden="true">۱</span> اطلاعات اولیه</li>
                <li aria-current={result ? 'step' : undefined}><span aria-hidden="true">۲</span> نتیجه و گزینه پیگیری</li>
              </ol>
              <p className="clinical-note">BMI یکی از معیارهای بررسیه. پزشک برای تصمیم درباره دارو، سابقه سلامت و شرایطت رو هم بررسی می‌کنه. <a href="https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity" target="_blank" rel="noopener noreferrer">منبع پزشکی</a></p>
            </div>

            <div className="form-card">
              <form ref={measurementForm} onSubmit={measure} hidden={Boolean(result)} noValidate autoComplete="off">
                {/* <p className="form-kicker">مرحله ۱ از ۲</p>
                <h3>قد و وزنت چقدره؟</h3> */}
                
                <div className="field-grid">
                  <div className="field">
                    <label className="label" htmlFor="height">قد</label>
                    <div className="input-wrap">
                      <input className="input" id="height" name="height" inputMode="decimal" placeholder="۱۶۵" required maxLength={12}
                        aria-invalid={Boolean(measurementErrors.height)} aria-describedby="height-error" />
                      <span className="unit" aria-hidden="true">سانتی‌متر</span>
                    </div>
                    <p className="field-error" id="height-error" hidden={!measurementErrors.height}>{measurementErrors.height}</p>
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="weight">وزن</label>
                    <div className="input-wrap">
                      <input className="input" id="weight" name="weight" inputMode="decimal" placeholder="۸۴٫۵" required maxLength={12}
                        aria-invalid={Boolean(measurementErrors.weight)} aria-describedby="weight-error" />
                      <span className="unit" aria-hidden="true">کیلوگرم</span>
                    </div>
                    <p className="field-error" id="weight-error" hidden={!measurementErrors.weight}>{measurementErrors.weight}</p>
                  </div>
                </div>

                <fieldset>
                  <legend>مشکلات سلامتی <span className="optional">(اختیاری)</span></legend>
                  <div className="choices">
                    {healthOptions.map((option) => (
                      <label className="choice" key={option}><input type="checkbox" name="health" value={option} /> {option}</label>
                    ))}
                    <label className="choice">
                      <input type="checkbox" name="health" value="other" checked={otherHealth}
                        onChange={(event) => setOtherHealth(event.target.checked)} /> مورد دیگه
                    </label>
                  </div>
                  {otherHealth && (
                    <div className="field health-note">
                      <label className="label" htmlFor="health-detail">مورد دیگه <span className="optional">(اختیاری)</span></label>
                      <textarea id="health-detail" name="healthDetail" maxLength={250} rows={2} placeholder="اگر دوست داری، کوتاه بنویس." />
                    </div>
                  )}
                </fieldset>
                <div className="form-actions"><button className="button" type="submit">محاسبه و دیدن نتیجه</button></div>
                
              </form>

              {result && (
                <section aria-labelledby="result-title">
                  {/* <p className="form-kicker">مرحله ۲ از ۲</p> */}
                  <h3 id="result-title" tabIndex={-1} ref={resultHeading}>نتیجه ارزیابی اولیه</h3>
                  <div className="result-box" data-pass={String(result.inRange)}>
                    <div className="result-metric">شاخص توده بدنی تو <strong>{result.display}</strong></div>
                    <p id="result-message">
                      {result.inRange
                        ? 'BMI تو به آستانه بررسی اولیه آمپول کاهش وزن می‌رسه.'
                        : 'با BMI زیر ۳۰، در محدوده بررسی اولیه برای استفاده از آمپول کاهش وزن نیستی.'}
                    </p>
                    <p id="result-context">{resultContext}</p>
                    {result.hasHealthContext && <p id="health-context">در گفت‌وگو با پزشک، مشکلات سلامتی‌ای رو که مشخص کردی مطرح کن.</p>}
                  </div>
                  <button type="button" className="text-button" onClick={editMeasurements} disabled={isSending}>
                    ویرایش قد، وزن یا اطلاعات سلامت
                  </button>

                  <div className="followup">
                      {status === 'submitted' || status === 'unknown' ? (
                        <section id="confirmation" aria-labelledby="confirmation-title">
                          <h3 id="confirmation-title" tabIndex={-1} ref={confirmationHeading}>درخواستت برای ارسال ثبت شد</h3>
                          <p>
                            {status === 'submitted'
                              ? 'درخواست به بله فرستاده شد، اما مرورگر امکان تأیید دریافت پیام را نمی‌دهد. برای هماهنگی مشاوره باهات تماس می‌گیریم.'
                              : 'وضعیت ارسال مشخص نیست و ممکنه پیام رسیده باشه. برای جلوگیری از پیام تکراری، دوباره ارسال نکن.'}
                          </p>
                        </section>
                      ) : (
                        <form onSubmit={sendContact} noValidate aria-busy={isSending}>
                          <h3>{result.inRange ? 'دوست داری زیر نظر متخصص‌ها وزن کم کنی؟' : 'دوست داری با تیم روکسانا در ارتباط باشی؟'}</h3>
                          <p className="form-intro">
                            {result.inRange
                              ? 'اسمت و یکی از راه‌های ارتباطی رو وارد کن تا تیم روکسانا برای هماهنگی مشاوره باهات ارتباط بگیره.'
                              : 'اگر دوست داری با تیم روکسانا صحبت کنی، اسمت و یکی از راه‌های ارتباطی رو وارد کن تا باهات تماس بگیریم.'}
                          </p>
                          <div className="field">
                            <label className="label" htmlFor="contact-name">نام</label>
                            <input className="input" id="contact-name" name="name" autoComplete="name" placeholder="اسم تو" required
                              maxLength={80} disabled={isSending} aria-invalid={Boolean(contactErrors.name)} aria-describedby="contact-name-error" />
                            <p className="field-error" id="contact-name-error" hidden={!contactErrors.name}>{contactErrors.name}</p>
                          </div>
                          <fieldset disabled={isSending}>
                            <legend>راه ارتباطی دلخواه</legend>
                            <div className="choices">
                              <label className="choice"><input type="radio" name="channel" value="phone" checked={byPhone}
                                onChange={() => { setChannel('phone'); setContactErrors({}); }} /> شماره موبایل</label>
                              <label className="choice"><input type="radio" name="channel" value="instagram" checked={!byPhone}
                                onChange={() => { setChannel('instagram'); setContactErrors({}); }} /> آیدی اینستاگرام</label>
                            </div>
                          </fieldset>
                          <div className="field contact-field">
                            <label className="label" htmlFor="contact-value">{byPhone ? 'شماره موبایل' : 'آیدی اینستاگرام'}</label>
                            <input className="input" id="contact-value" name="contact" key={channel} dir="ltr" maxLength={40} required
                              type={byPhone ? 'tel' : 'text'} autoComplete={byPhone ? 'tel' : 'off'}
                              placeholder={byPhone ? '0912 345 6789' : '@username'} disabled={isSending}
                              aria-invalid={Boolean(contactErrors.contact)} aria-describedby="contact-value-error" />
                            <p className="field-error" id="contact-value-error" hidden={!contactErrors.contact}>{contactErrors.contact}</p>
                          </div>
                          <div className="form-actions">
                            <button className="button" type="submit" disabled={isSending}>
                              {isSending ? 'در حال ارسال…' : 'ارسال درخواست تماس'}
                            </button>
                          </div>
                          {sendError && <p className="field-error submit-error" role="alert">{sendError}</p>}
                        </form>
                      )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p className="small"><strong>روکسانا</strong> · سبک زندگی و تناسب اندام</p>
          <a href="#top">بازگشت به بالای صفحه ↑</a>
        </div>
      </footer>
    </>
  );
}
