import React, { useEffect, useRef, useState } from 'react';
import { answerText, photoSlots, questions, sections, validateAnswers, validatePhoto } from '../../lib/questionnaire.js';
import { sendQuestionnaire, validBaleConfig } from '../../lib/questionnaire-delivery.js';

const fa = (number) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(number);

function Arrow({ back = false }) {
  return <svg className={back ? 'q-arrow q-arrow-back' : 'q-arrow'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>;
}

function PhotoPreview({ file }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url ? <img src={url} alt="پیش‌نمایش عکس انتخاب‌شده" /> : null;
}

function Answers({ answers, photos, onEdit }) {
  return <div className="q-review">
    {sections.map((section, index) => <section className="q-review-section" key={section.short}>
      <div className="q-review-heading"><h3>{section.title}</h3>{onEdit && <button type="button" className="q-text-button" onClick={() => onEdit(index)}>ویرایش <span className="q-sr-only">{section.short}</span></button>}</div>
      <dl>{questions.filter((question) => question.section === index).map((question) => <div key={question.id}>
        <dt>{fa(question.number)}. {question.label}</dt>
        <dd dir="auto">{answerText(question, answers, photos)}</dd>
      </div>)}</dl>
    </section>)}
  </div>;
}

export default function Questionnaire() {
  const [answers, setAnswers] = useState({});
  const [photos, setPhotos] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [sendError, setSendError] = useState('');
  const [progress, setProgress] = useState([0, 0]);
  const [reference, setReference] = useState('');
  const sending = useRef(false);
  const heading = useRef(null);
  const moved = useRef(false);
  const finished = status === 'submitted' || status === 'unknown';
  const busy = status === 'sending';
  const reviewing = step === sections.length;
  const answered = questions.filter((question) => String(answers[question.id] || '').trim()).length;
  const currentQuestions = questions.filter((question) => question.section === step);

  useEffect(() => {
    if (moved.current || finished) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [step, finished]);

  useEffect(() => {
    const first = Object.keys(errors).find((id) => questions.find((question) => question.id === id)?.section === step);
    if (first) document.getElementById(`q-${first}`)?.focus();
  }, [errors, step]);

  useEffect(() => {
    if (!answered || finished) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [answered, finished]);

  function changeAnswer(id, value) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => { const next = { ...previous }; delete next[id]; return next; });
    if (id === 'photos' && value !== questions.find((question) => question.id === 'photos').options[0]) {
      setPhotos({});
      setPhotoErrors({});
    }
  }

  function choosePhoto(slot, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validatePhoto(file);
    setPhotoErrors((previous) => ({ ...previous, [slot]: error }));
    if (error) { event.target.value = ''; return; }
    setPhotos((previous) => ({ ...previous, [slot]: file }));
  }

  function goTo(next) {
    moved.current = true;
    setStep(next);
    setErrors({});
    setSendError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (sending.current || finished) return;
    const nextErrors = validateAnswers(answers, reviewing ? undefined : step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = questions.find((question) => nextErrors[question.id]);
      moved.current = true;
      setStep(first.section);
      return;
    }
    if (!reviewing) { goTo(step + 1); return; }
    const config = {
      token: import.meta.env.VITE_BALE_BOT_TOKEN?.trim(),
      chatIds: [import.meta.env.VITE_BALE_CHAT_ID?.trim(), import.meta.env.VITE_BALE_CHAT_ID2?.trim()],
    };
    if (!validBaleConfig(config)) {
      setSendError('تنظیمات ارسال پیدا نشد. لطفاً با تیم رکسانا تماس بگیر.');
      return;
    }
    // Lock synchronously so a double click cannot send the form twice.
    sending.current = true;
    setStatus('sending');
    setSendError('');
    const id = `RX-${crypto.randomUUID()}`;
    setReference(id);
    try {
      setStatus(await sendQuestionnaire({ config, answers, photos, reference: id, onProgress: (done, total) => setProgress([done, total]) }));
    } catch {
      setStatus('unknown');
    } finally {
      sending.current = false;
    }
  }

  function renderQuestion(question) {
    const id = `q-${question.id}`;
    const value = answers[question.id] || '';
    const description = `${id}-hint ${id}-error`;
    const label = <><span className="q-number">{fa(question.number).padStart(2, '۰')}</span><span>{question.label}</span></>;
    const fieldProps = {
      id, name: question.id, value, required: !question.optional,
      maxLength: question.maxLength, 'aria-invalid': Boolean(errors[question.id]),
      'aria-describedby': description, onChange: (event) => changeAnswer(question.id, event.target.value),
    };
    const isChoice = question.type === 'choice' || question.type === 'photos';
    return <div className={`q-field q-field-${question.type}`} key={question.id}>
      {isChoice ? <fieldset id={id} tabIndex={-1} aria-describedby={description} aria-invalid={Boolean(errors[question.id])}>
        <legend className="q-label">{label}</legend>
        <div className="q-choices">{question.options.map((option) => <label className="q-choice" key={option}>
          <input type="radio" name={question.id} value={option} checked={value === option} required={!question.optional} onChange={() => changeAnswer(question.id, option)} />
          <span>{option}</span>
        </label>)}</div>
        {question.type === 'photos' && value === question.options[0] && <div className="q-photo-area">
          <p className="q-hint">هر کدوم رو که مایلی اضافه کن؛ JPG یا PNG، حداکثر ۵ مگابایت برای هر عکس.</p>
          <div className="q-photos">{photoSlots.map((slot) => <div className="q-photo" key={slot.id}>
            <label className="q-photo-label" htmlFor={`photo-${slot.id}`}>{slot.label} <span>(اختیاری)</span></label>
            {photos[slot.id] && <PhotoPreview file={photos[slot.id]} />}
            <input id={`photo-${slot.id}`} type="file" accept="image/jpeg,image/png" aria-describedby={`photo-${slot.id}-error`} aria-invalid={Boolean(photoErrors[slot.id])} onChange={(event) => choosePhoto(slot.id, event)} />
            {photos[slot.id] && <><p className="q-file-name" dir="auto">{photos[slot.id].name}</p><button className="q-text-button" type="button" onClick={() => {
              setPhotos((previous) => { const next = { ...previous }; delete next[slot.id]; return next; });
              setPhotoErrors((previous) => ({ ...previous, [slot.id]: '' }));
              document.getElementById(`photo-${slot.id}`).value = '';
            }}>حذف عکس <span className="q-sr-only">{slot.label}</span></button></>}
            <p className="q-error" id={`photo-${slot.id}-error`} role={photoErrors[slot.id] ? 'alert' : undefined}>{photoErrors[slot.id]}</p>
          </div>)}</div>
        </div>}
      </fieldset> : <>
        <label className="q-label" htmlFor={id}>{label}</label>
        {question.type === 'textarea'
          ? <textarea {...fieldProps} rows={3} placeholder="اینجا برام بنویس…" dir="auto" />
          : <div className="q-input-wrap"><input {...fieldProps} type="text" inputMode={question.type === 'number' ? (question.id === 'age' ? 'numeric' : 'decimal') : 'text'}
            autoComplete={question.autoComplete || 'off'} placeholder={question.placeholder} dir={question.id === 'contact' ? 'ltr' : 'rtl'} />{question.unit && <span className="q-unit">{question.unit}</span>}</div>}
      </>}
      <p className="q-hint" id={`${id}-hint`}>{question.hint}</p>
      <p className="q-error" id={`${id}-error`}>{errors[question.id]}</p>
    </div>;
  }

  return <div className="q-page">
    <a className="q-skip" href="#questionnaire">رفتن به پرسشنامه</a>
    <header className="q-header"><div className="q-container q-header-inner">
      <a className="q-brand" href="/" aria-label="صفحه اصلی رکسانا"><img src="/roxana-logo.png" alt="" /><span>رکسانا<small>همراه تو، برای حال بهتر</small></span></a>
      <span className="q-header-label">پرسشنامه شروع همراهی</span>
    </div></header>
    <main className="q-container q-layout" id="questionnaire">
      <aside className="q-aside">
        <p className="q-eyebrow"><span /> یه شروع، برای خودت</p>
        <h1>برنامهٔ تو،<br /> از <em>شناخت تو</em><br className="q-desktop-break" /> شروع می‌شه.</h1>
        <p className="q-lead">چند دقیقه برای خودت وقت بذار. از هدفت، حال بدنت و عادت‌هات بگو تا مسیرمون رو با شناخت بیشتری شروع کنیم.</p>
        <div className="q-aside-note"><span className="q-note-icon" aria-hidden="true">✦</span><p>اینجا جواب درست و غلط نداریم؛<br />فقط خودت باش و راحت بنویس.</p></div>
        <div className="q-meta"><span>۲۳ سؤال</span><span>عکس‌ها اختیاری</span></div>
        <p className="q-aside-footer">قدم‌های کوچیک، تغییرهای موندگار.</p>
      </aside>
      <div className="q-panel">
        {finished ? <section className="q-completion" aria-labelledby="q-title">
          <div className="q-completion-icon" aria-hidden="true">{status === 'submitted' ? '✓' : '…'}</div>
          <p className="q-eyebrow">ممنون که از خودت گفتی</p>
          <h2 id="q-title" ref={heading} tabIndex={-1}>{status === 'submitted' ? 'درخواست ارسال پرسشنامه انجام شد.' : 'وضعیت ارسال مشخص نیست.'}</h2>
          <p>{status === 'submitted'
            ? 'پاسخ‌ها و عکس‌های انتخاب‌شده از مرورگرت فرستاده شدن. تأیید دریافت پیام از داخل مرورگر ممکن نیست؛ اگر پیگیری لازم شد، با تیم رکسانا در ارتباط باش.'
            : 'ممکنه همه یا بخشی از پاسخ‌ها رسیده باشن. برای جلوگیری از پیام تکراری، دوباره ارسال نکن و با تیم رکسانا پیگیری کن.'}</p>
          <p className="q-reference">شناسه پیگیری: <bdi>{reference}</bdi></p>
          <details className="q-sent-answers"><summary>دیدن پاسخ‌های من</summary><Answers answers={answers} photos={photos} /></details>
        </section> : <>
          <nav className="q-stepper" aria-label="مراحل پرسشنامه"><ol>{[...sections.map((section) => section.short), 'مرور و ارسال'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-done={step > index}>
            <span className="q-step-dot" aria-hidden="true">{step > index ? '✓' : fa(index + 1)}</span><span>{label}</span>
          </li>)}</ol></nav>
          <div className="q-progress-row"><span>{reviewing ? 'یک نگاه آخر، بعد ارسال' : `مرحله ${fa(step + 1)} از ۴`}</span><span>{fa(answered)} از ۲۳ پاسخ</span></div>
          <div className="q-progress" role="progressbar" aria-label="پاسخ‌های واردشده" aria-valuemin={0} aria-valuemax={23} aria-valuenow={answered}><span style={{ width: `${answered / 23 * 100}%` }} /></div>
          <div className="q-section-intro"><h2 id="q-title" ref={heading} tabIndex={-1}>{reviewing ? 'همه‌چیز درسته؟' : sections[step].title}</h2><p>{reviewing ? 'جواب‌هات رو یک بار مرور کن. هر جا خواستی می‌تونی برگردی و ویرایش کنی.' : sections[step].description}</p></div>
          <form onSubmit={submit} noValidate aria-busy={busy}>
            <fieldset className="q-fields" disabled={busy} aria-label={reviewing ? 'مرور پاسخ‌ها' : sections[step].title}>
              {reviewing ? <Answers answers={answers} photos={photos} onEdit={goTo} /> : currentQuestions.map(renderQuestion)}
            </fieldset>
            {Object.keys(errors).length > 0 && <p className="q-error q-error-summary" role="alert">لطفاً سؤال‌های مشخص‌شده رو کامل کن تا ادامه بدیم.</p>}
            {reviewing && <p className="q-send-note">با زدن دکمهٔ ارسال، پاسخ‌ها و عکس‌های انتخاب‌شده‌ات برای تیم رکسانا ارسال می‌شن.</p>}
            <div className="q-actions">
              <button className="q-button" type="submit" disabled={busy}>{busy ? 'در حال ارسال…' : reviewing ? 'ارسال پرسشنامه' : 'ادامه بدیم'}{!busy && <Arrow />}</button>
              {step > 0 && <button className="q-back" type="button" disabled={busy} onClick={() => goTo(step - 1)}><Arrow back />مرحله قبل</button>}
            </div>
            {busy && <p className="q-hint q-status" role="status">در حال ارسال پاسخ‌ها و عکس‌ها؛ لطفاً این صفحه رو باز نگه دار.{progress[1] > 0 ? ` (${fa(progress[0])} از ${fa(progress[1])})` : ''}</p>}
            {sendError && <p className="q-error q-error-summary" role="alert">{sendError}</p>}
          </form>
        </>}
      </div>
    </main>
    <footer className="q-container q-footer"><span>رکسانا · حرکت، تغذیه، حال خوب</span><a href="/">صفحه اصلی <Arrow /></a></footer>
  </div>;
}
