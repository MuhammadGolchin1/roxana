import React, { useEffect, useRef, useState } from 'react';
import SiteFooter from '../components/SiteFooter.jsx';
import { answerText, detailMaxLength, hasDetails, OTHER_OPTION, photoSlots, questions, sections, selectedOptions, toggleOption, validateAnswers, validatePhoto } from '../../lib/questionnaire.js';
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
        <dd dir="auto">{answerText(question, answers, photos) || 'جوابی ندادی'}</dd>
      </div>)}</dl>
    </section>)}
  </div>;
}

function ChoiceFields({ question, value, id, onChange, optional = true, describedBy }) {
  const selected = selectedOptions(value);
  const multiple = question.type === 'multi';
  return <>
    <p className="q-hint q-choice-hint" id={`${id}-selection-hint`}>{multiple ? 'می‌تونی چند تا گزینه رو انتخاب کنی.' : 'یه گزینه رو انتخاب کن.'}</p>
    <div className="q-choices" aria-describedby={`${id}-selection-hint`}>
      {question.options.map((option) => <label className="q-choice" key={option}>
        <input type={multiple ? 'checkbox' : 'radio'} name={id} value={option} checked={selected.includes(option)}
          required={!optional && !multiple} aria-describedby={describedBy}
          onChange={() => onChange(toggleOption(question, value, option))} />
        <span>{option}</span>
      </label>)}
    </div>
    {question.options.includes(OTHER_OPTION) && selected.includes(OTHER_OPTION) && <div className="q-choice-detail">
      <label className="q-detail-label" htmlFor={`${id}-other`}>سایر؛ اینجا برامون بنویس</label>
      <textarea id={`${id}-other`} name={`${id}-other`} rows={2} dir="auto" required maxLength={detailMaxLength}
        value={value?.other || ''} aria-describedby={describedBy}
        onChange={(event) => onChange({ selected, details: value?.details || '', other: event.target.value })} />
    </div>}
    {hasDetails(question, value) && <div className="q-choice-detail">
      <label className="q-detail-label" htmlFor={`${id}-details`}>{question.detailLabel}</label>
      <textarea id={`${id}-details`} name={`${id}-details`} rows={2} dir="auto" maxLength={detailMaxLength}
        value={value?.details || ''} aria-describedby={describedBy}
        onChange={(event) => onChange({ selected, other: value?.other || '', details: event.target.value })} />
    </div>}
  </>;
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
  const errorToFocus = useRef(null);
  const finished = status === 'submitted' || status === 'unknown';
  const busy = status === 'sending';
  const reviewing = step === sections.length;
  const answered = questions.filter((question) => answerText(question, answers, photos) && (question.id !== 'photos' || answers.photos)).length;
  const currentQuestions = questions.filter((question) => question.section === step);

  useEffect(() => {
    if (moved.current || finished) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [step, finished]);

  useEffect(() => {
    // Only a failed submission requests focus; clearing errors while typing must not move it.
    const first = errorToFocus.current;
    errorToFocus.current = null;
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
      errorToFocus.current = first.id;
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
      setSendError('الان نمی‌تونیم فرم رو بفرستیم. لطفاً با تیم رکسانا در ارتباط باش.');
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
    const isChoice = ['choice', 'multi', 'groups', 'photos'].includes(question.type);
    return <div className={`q-field q-field-${question.type}`} key={question.id}>
      {isChoice ? <fieldset id={id} tabIndex={-1} aria-describedby={description} aria-invalid={Boolean(errors[question.id])}>
        <legend className="q-label">{label}</legend>
        {question.type === 'groups' ? <div className="q-choice-groups">{question.groups.map((group) => <fieldset key={group.id} aria-describedby={description}>
          <legend className="q-detail-label">{group.label}</legend>
          <ChoiceFields question={group} value={value[group.id]} id={`${id}-${group.id}`} describedBy={description}
            onChange={(next) => changeAnswer(question.id, { ...value, [group.id]: next })} />
        </fieldset>)}</div> : question.type !== 'photos' ? <ChoiceFields question={question} value={value} id={id}
          optional={question.optional} describedBy={description} onChange={(next) => changeAnswer(question.id, next)} /> : <div className="q-choices">{question.options.map((option) => <label className="q-choice" key={option}>
          <input type="radio" name={question.id} value={option} checked={value === option} required={!question.optional} onChange={() => changeAnswer(question.id, option)} />
          <span>{option}</span>
        </label>)}</div>}
        {question.type === 'photos' && value === question.options[0] && <div className="q-photo-area">
          <p className="q-hint">هر کدوم از عکس‌ها رو که دوست داری اضافه کن. فرمت <bdi>JPG</bdi> یا <bdi>PNG</bdi>، تا ۵ مگابایت برای هر عکس.</p>
          <div className="q-photos">{photoSlots.map((slot) => <div className="q-photo" key={slot.id}>
            <label className="q-photo-label" htmlFor={`photo-${slot.id}`}>{slot.label} <span>(اختیاری)</span></label>
            {photos[slot.id] && <PhotoPreview file={photos[slot.id]} />}
            <input id={`photo-${slot.id}`} type="file" accept="image/jpeg,image/png" aria-describedby={`photo-${slot.id}-error`} aria-invalid={Boolean(photoErrors[slot.id])} onChange={(event) => choosePhoto(slot.id, event)} />
            {photos[slot.id] && <><p className="q-file-name" dir="auto">{photos[slot.id].name}</p><button className="q-text-button" type="button" onClick={() => {
              setPhotos((previous) => { const next = { ...previous }; delete next[slot.id]; return next; });
              setPhotoErrors((previous) => ({ ...previous, [slot.id]: '' }));
              document.getElementById(`photo-${slot.id}`).value = '';
            }}>عکس رو بردار <span className="q-sr-only">{slot.label}</span></button></>}
            <p className="q-error" id={`photo-${slot.id}-error`} role={photoErrors[slot.id] ? 'alert' : undefined}>{photoErrors[slot.id]}</p>
          </div>)}</div>
        </div>}
      </fieldset> : <>
        <label className="q-label" htmlFor={id}>{label}</label>
        {question.type === 'textarea'
          ? <textarea {...fieldProps} rows={3} placeholder="اینجا برامون بنویس…" dir="auto" />
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
      <a className="q-brand" href={import.meta.env.BASE_URL} aria-label="صفحهٔ اصلی رکسانا"><img src={import.meta.env.BASE_URL + "roxana-logo.png"} width="62" height="62" alt="" /><span>رکسانا<small>همراه تو، برای حال بهتر</small></span></a>
      <span className="q-header-label">پرسشنامه شروع همراهی</span>
    </div></header>
    <main className="q-container q-layout" id="questionnaire">
      <aside className="q-aside">
        <p className="q-eyebrow"><span /> یه فرصت برای شناخت تو</p>
        <h1>برنامهٔ تو،<br /> از <em>شناخت تو</em><br className="q-desktop-break" /> شروع می‌شه.</h1>
        <p className="q-lead">از هدف‌هات، حال بدنت و عادت‌های روزمره‌ت بگو تا با شناخت بهتری از شرایطت شروع کنیم.</p>
        <div className="q-aside-note"><span className="q-note-icon" dir="ltr" aria-hidden="true">{'}'}</span><p>اینجا جواب درست و غلط نداریم؛<br />هر چی به شرایطت نزدیک‌تره انتخاب کن.</p></div>
        <div className="q-meta"><span>{fa(questions.length)} سؤال</span><span>فقط بخش اول اجباریه</span></div>
        <p className="q-aside-footer">قدم‌های کوچیک، تغییرهای موندگار.</p>
      </aside>
      <div className="q-panel">
        {finished ? <section className="q-completion" aria-labelledby="q-title">
          <div className="q-completion-icon" aria-hidden="true">{status === 'submitted' ? '✓' : '…'}</div>
          <p className="q-eyebrow">ممنون که وقت گذاشتی</p>
          <h2 id="q-title" ref={heading} tabIndex={-1}>{status === 'submitted' ? 'درخواستت رو فرستادیم.' : 'مطمئن نیستیم فرم رسیده یا نه.'}</h2>
          <p>{status === 'submitted'
            ? 'جواب‌ها و عکس‌هات رو از مرورگرت فرستادیم. از اینجا نمی‌تونیم مطمئن بشیم پیام رسیده یا نه؛ برای پیگیری با تیم رکسانا در ارتباط باش.'
            : 'ممکنه همه یا یه بخشی از جواب‌هات رسیده باشن. برای اینکه پیام تکراری نره، دوباره نفرست و با تیم رکسانا پیگیری کن.'}</p>
          <p className="q-reference">کد پیگیری: <bdi>{reference}</bdi></p>
          <details className="q-sent-answers"><summary>جواب‌هام رو ببینم</summary><Answers answers={answers} photos={photos} /></details>
        </section> : <>
          <nav className="q-stepper" aria-label="مراحل پرسشنامه"><ol>{[...sections.map((section) => section.short), 'مرور و ارسال'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-done={step > index}>
            <span className="q-step-dot" aria-hidden="true">{step > index ? '✓' : fa(index + 1)}</span><span>{label}</span>
          </li>)}</ol></nav>
          <div className="q-progress-row"><span>{reviewing ? 'یه نگاه آخر، بعد بفرست' : `مرحلهٔ ${fa(step + 1)} از ${fa(sections.length)}`}</span><span>{fa(answered)} از {fa(questions.length)} جواب</span></div>
          <div className="q-progress" role="progressbar" aria-label="پاسخ‌های واردشده" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}><span style={{ width: `${answered / questions.length * 100}%` }} /></div>
          <div className="q-section-intro"><h2 id="q-title" ref={heading} tabIndex={-1}>{reviewing ? 'جواب‌هات رو یه بار مرور کن' : sections[step].title}</h2><p>{reviewing ? 'قبل از فرستادن فرم، جواب‌هات رو بررسی کن. هر جا خواستی می‌تونی برگردی و ویرایشش کنی.' : sections[step].description}</p>{!reviewing && step > 0 && <p>سؤال‌های این بخش اختیاریه؛ می‌تونی خالی بذاری و ادامه بدی.</p>}</div>
          <form onSubmit={submit} noValidate aria-busy={busy}>
            <fieldset className="q-fields" disabled={busy} aria-label={reviewing ? 'مرور پاسخ‌ها' : sections[step].title}>
              {reviewing ? <Answers answers={answers} photos={photos} onEdit={goTo} /> : currentQuestions.map(renderQuestion)}
            </fieldset>
            {Object.keys(errors).length > 0 && <p className="q-error q-error-summary" role="alert">اول سؤال‌هایی رو که مشخص کردیم کامل کن تا ادامه بدیم.</p>}
            {reviewing && <p className="q-send-note">وقتی دکمهٔ ارسال رو بزنی، جواب‌ها و عکس‌هایی که انتخاب کردی برای تیم رکسانا فرستاده می‌شن.</p>}
            <div className="q-actions">
              <button className="q-button" type="submit" disabled={busy}>{busy ? 'داریم می‌فرستیم…' : reviewing ? 'پرسشنامه رو بفرست' : 'ادامه بدیم'}{!busy && <Arrow />}</button>
              {step > 0 && <button className="q-back" type="button" disabled={busy} onClick={() => goTo(step - 1)}><Arrow back />برگرد عقب</button>}
            </div>
            {busy && <p className="q-hint q-status" role="status">داریم جواب‌ها و عکس‌هات رو می‌فرستیم؛ لطفاً صفحه رو باز نگه دار.{progress[1] > 0 ? ` (${fa(progress[0])} از ${fa(progress[1])})` : ''}</p>}
            {sendError && <p className="q-error q-error-summary" role="alert">{sendError}</p>}
          </form>
        </>}
      </div>
    </main>
    <SiteFooter />
  </div>;
}
