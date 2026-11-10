import React, { useEffect, useRef, useState } from 'react';
import { assess, healthOptions, validateContact } from '../../lib/assessment.js';

import SiteLayout from '../components/SiteLayout.jsx';

const sendErrors = {
  not_configured: 'الان نمی‌تونیم درخواستت رو بفرستیم. لطفاً از راه‌های ارتباطی پایین صفحه با تیم رکسانا در ارتباط باش.',
};

export default function Assessment() {
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
    if (assessment.invalidHeight) errors.height = 'قدت رو بین ۷۰ و ۲۷۰ سانتی‌متر، با حداکثر دو رقم اعشار وارد کن.';
    if (assessment.invalidWeight) errors.weight = 'وزنت رو بین ۱۵ و ۶۵۰ کیلوگرم، با حداکثر دو رقم اعشار وارد کن.';
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
        ? 'شمارهٔ موبایلت رو مثل ۰۹۱۲۳۴۵۶۷۸۹ وارد کن.'
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
          ? `سایر${result.healthDetail.trim() ? `: ${result.healthDetail.trim()}` : ''}`
          : item
      ));
      const message = [
        'درخواست پیگیری رکسانا',
        'نام: ' + contact.name,
        channelLabel + ': ' + contact.value,
        'شاخص تودهٔ بدنی: ' + result.display,
        'مشکلات سلامتی: ' + (healthLabels.length ? healthLabels.join('، ') : 'چیزی ننوشتی'),
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
    ? 'اینکه آمپول برات مناسبه و درمان رو شروع کنی یا نه، با پزشکه.'
    : result?.bmi >= 27
      ? 'اگه شاخص تودهٔ بدنی‌ت ۲۷ یا بیشتر باشه و بعضی مشکلات مرتبط با وزن رو داشته باشی، پزشک می‌تونه گزینهٔ دارو رو هم بررسی کنه.'
      : 'اگه برای مدیریت وزنت سؤال داری، می‌تونی دربارهٔ گزینه‌های مناسب با پزشک صحبت کنی.';

  return (
    <SiteLayout assessment>
      <section className="assessment" id="assessment" aria-labelledby="assessment-title">
        <div className="wrap assessment-grid">
          <div className="assessment-aside">
            <p className="eyebrow">ارزیابی اولیه · محاسبهٔ شاخص تودهٔ بدنی</p>
            <h1 id="assessment-title">قد و وزنت رو بگو تا از اینجا شروع کنیم</h1>
            <p>قد و وزنت رو وارد کن تا شاخص تودهٔ بدنی (<bdi>BMI</bdi>) خودت رو ببینی. اگه دوست داشتی، مشکلات سلامتی‌ت رو هم مشخص کن.</p>
            <ol className="steps" aria-label="مراحل ارزیابی">
              <li aria-current={result ? undefined : 'step'}><span aria-hidden="true">۱</span> اطلاعات اولیه</li>
              <li aria-current={result ? 'step' : undefined}><span aria-hidden="true">۲</span> نتیجه و پیگیری</li>
            </ol>
            <p className="clinical-note">شاخص تودهٔ بدنی فقط یکی از معیارهای بررسیه. پزشک برای تصمیم دربارهٔ دارو، سابقهٔ سلامتی و شرایطت رو هم بررسی می‌کنه. <a href="https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity" target="_blank" rel="noopener noreferrer">راهنمای پزشکی کاهش وزن رو بخون</a></p>
          </div>

          <div className="form-card">
            <form ref={measurementForm} onSubmit={measure} hidden={Boolean(result)} noValidate autoComplete="off">
              <h2 className="form-title">قد و وزنت چقدره؟</h2>
              
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
                      onChange={(event) => setOtherHealth(event.target.checked)} /> سایر
                  </label>
                </div>
                {otherHealth && (
                  <div className="field health-note">
                    <label className="label" htmlFor="health-detail">توضیحات بیشتر <span className="optional">(اختیاری)</span></label>
                    <textarea id="health-detail" name="healthDetail" maxLength={250} rows={2} placeholder="اگه دوست داشتی، کوتاه برامون بنویس." />
                  </div>
                )}
              </fieldset>
              <div className="form-actions"><button className="button" type="submit">نتیجه‌م رو ببینم</button></div>
              
            </form>

            {result && (
              <section aria-labelledby="result-title">
                <h2 className="form-title" id="result-title" tabIndex={-1} ref={resultHeading}>نتیجهٔ ارزیابی اولیه</h2>
                <div className="result-box" data-pass={String(result.inRange)}>
                  <div className="result-metric">شاخص تودهٔ بدنی تو <strong className={result.bmi > 30 ? 'bmi-high' : undefined}>{result.display}</strong></div>
                  <p id="result-message">
                    {result.inRange
                      ? 'شاخص تودهٔ بدنی‌ت به حدی می‌رسه که می‌تونیم بررسی اولیهٔ آمپول کاهش وزن رو شروع کنیم.'
                      : 'شاخص تودهٔ بدنی‌ت زیر ۳۰ و پایین‌تر از حد بررسی اولیهٔ این فرمه.'}
                  </p>
                  <p id="result-context">{resultContext}</p>
                  {result.hasHealthContext && <p id="health-context">وقتی با پزشک صحبت می‌کنی، مشکلات سلامتی‌ای رو هم که نوشتی بهش بگو.</p>}
                </div>
                <button type="button" className="text-button" onClick={editMeasurements} disabled={isSending}>
                  اطلاعاتم رو ویرایش کنم
                </button>

                <div className="followup">
                    {status === 'submitted' || status === 'unknown' ? (
                      <section id="confirmation" aria-labelledby="confirmation-title">
                        <h3 id="confirmation-title" tabIndex={-1} ref={confirmationHeading}>{status === 'submitted' ? 'درخواستت رو فرستادیم' : 'مطمئن نیستیم پیام رسیده یا نه'}</h3>
                        <p>
                          {status === 'submitted'
                            ? 'درخواستت برای تیم رکسانا فرستاده شد. از توی مرورگر نمی‌تونیم مطمئن بشیم پیام رسیده یا نه؛ برای پیگیری از راه‌های ارتباطی پایین صفحه استفاده کن.'
                            : 'ممکنه پیام رسیده باشه. برای اینکه پیام تکراری نره، دوباره نفرست و با تیم رکسانا پیگیری کن.'}
                        </p>
                      </section>
                    ) : (
                      <form onSubmit={sendContact} noValidate aria-busy={isSending}>
                        <h3>دوست داری با تیم رکسانا حرف بزنی؟</h3>
                        <p className="form-intro">
                          {result.inRange
                            ? 'اسمت و یه راه ارتباطی بذار تا برای هماهنگی مشاوره باهات در ارتباط باشیم.'
                            : 'اگه دوست داری با تیم رکسانا صحبت کنی، اسمت و یه راه ارتباطی بذار.'}
                        </p>
                        <div className="field">
                          <label className="label" htmlFor="contact-name">اسمت</label>
                          <input className="input" id="contact-name" name="name" autoComplete="name" placeholder="مثلاً رکسانا" required
                            maxLength={80} disabled={isSending} aria-invalid={Boolean(contactErrors.name)} aria-describedby="contact-name-error" />
                          <p className="field-error" id="contact-name-error" hidden={!contactErrors.name}>{contactErrors.name}</p>
                        </div>
                        <fieldset disabled={isSending}>
                          <legend>از چه راهی باهات در ارتباط باشیم؟</legend>
                          <div className="choices">
                            <label className="choice"><input type="radio" name="channel" value="phone" checked={byPhone}
                              onChange={() => { setChannel('phone'); setContactErrors({}); }} /> شمارهٔ موبایل</label>
                            <label className="choice"><input type="radio" name="channel" value="instagram" checked={!byPhone}
                              onChange={() => { setChannel('instagram'); setContactErrors({}); }} /> آیدی اینستاگرام</label>
                          </div>
                        </fieldset>
                        <div className="field contact-field">
                          <label className="label" htmlFor="contact-value">{byPhone ? 'شمارهٔ موبایلت' : 'آیدی اینستاگرامت'}</label>
                          <input className="input" id="contact-value" name="contact" key={channel} dir="ltr" maxLength={40} required
                            type={byPhone ? 'tel' : 'text'} autoComplete={byPhone ? 'tel' : 'off'}
                            placeholder={byPhone ? '0912 345 6789' : '@username'} disabled={isSending}
                            aria-invalid={Boolean(contactErrors.contact)} aria-describedby="contact-value-error" />
                          <p className="field-error" id="contact-value-error" hidden={!contactErrors.contact}>{contactErrors.contact}</p>
                        </div>
                        <div className="form-actions">
                          <button className="button" type="submit" disabled={isSending}>
                            {isSending ? 'داریم می‌فرستیم…' : 'درخواستم رو بفرست'}
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
    </SiteLayout>
  );
}
