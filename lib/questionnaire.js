import { parseMeasurement, validateContact } from './assessment.js';

export const sections = [
  { title: 'بیا آشنا بشیم', short: 'آشنایی', description: 'از خودت بگو تا بهتر بشناسمت.' },
  { title: 'هدفت و حال بدنت', short: 'هدف و سلامت', description: 'این جواب‌ها کمک می‌کنن شرایط و نیازهای بدنت رو بهتر بشناسم.' },
  { title: 'ورزش توی زندگی تو', short: 'تمرین', description: 'برنامه‌ای که با وقت و امکاناتت جور باشه، راحت‌تر ادامه پیدا می‌کنه.' },
  { title: 'سلیقه و عادت‌های غذایی', short: 'تغذیه', description: 'بگو چه غذاهایی دوست داری و چه عادت‌هایی داری.' },
];

export const photoSlots = [
  { id: 'front', label: 'روبه‌رو' },
  { id: 'side', label: 'پهلو' },
  { id: 'back', label: 'پشت' },
];

export const questions = [
  { id: 'name', section: 0, label: 'اسمی که دوست داری صدات کنم', type: 'text', maxLength: 80, autoComplete: 'name', placeholder: 'مثلا رکسانا' },
  { id: 'age', section: 0, label: 'چند سالته؟', type: 'number', maxLength: 3, placeholder: 'مثلاً ۳۲', unit: 'سال' },
  { id: 'gender', section: 0, label: 'جنسیتت چیه ؟', type: 'choice', options: ['خانم', 'آقا', 'سایر', 'ترجیح می‌دم نگم'] },
  { id: 'height', section: 0, label: 'قدت چنده؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۱۶۵', unit: 'سانتی‌متر' },
  { id: 'weight', section: 0, label: 'وزنت چقدره؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۷۰٫۵', unit: 'کیلوگرم' },
  { id: 'contact', section: 0, label: 'آیدی اینستاتو یا شماره‌ای بده که بتونم باهات در ارتباط باشم.', type: 'text', maxLength: 40, placeholder: '09123456789 یا @username', hint: 'یکی از این دو کافیه: شماره موبایل یا آیدی اینستاگرام.' },
  { id: 'occupation', section: 1, label: 'شغلت چیه و روزا چقدر تحرک داری؟' },
  { id: 'goal', section: 1, label: 'دوست داری تو این دوره دقیقاً به چه هدفی برسی؟' },
  { id: 'conditions', section: 1, label: 'آیا بیماری خاصی داری که باید در جریانش باشم؟', hint: 'اگر موردی نداری، بنویس «ندارم».' },
  { id: 'medications', section: 1, label: 'الان داروی خاصی مصرف می‌کنی؟', hint: 'اگر مصرف می‌کنی، اسم و مقدارش رو هم بنویس؛ در غیر این صورت بنویس «نه».' },
  { id: 'pain', section: 1, label: 'جایی از بدنت درد مفصلی یا اسکلتی داری؟' },
  { id: 'injuries', section: 1, label: 'تا حالا سابقه آسیب‌دیدگی ورزشی یا جراحی داشتی؟' },
  { id: 'sleep', section: 1, label: 'معمولاً شب‌ها چند ساعت می‌خوابی و کیفیت خوابت چطوره؟' },
  { id: 'photos', section: 1, label: 'دوست داری برای بررسی دقیق‌تر فرم بدن، سه تا عکس (از روبه‌رو، پهلو و پشت) با لباس ورزشی چسبان برام بفرستی؟ (اختیاری)', type: 'photos', optional: true, options: ['الان عکس‌ها رو اضافه می‌کنم', 'بعداً می‌فرستم', 'تمایلی ندارم'] },
  { id: 'experience', section: 2, label: 'تا حالا چقدر اهل ورزش بودی و سابقه ورزشی داری؟' },
  { id: 'location', section: 2, label: 'ترجیح میدی تمریناتت رو کجا انجام بدی؟ (توی خونه یا باشگاه؟)', type: 'choice', options: ['توی خونه', 'باشگاه', 'هر دو'] },
  { id: 'availability', section: 2, label: 'تو طول هفته چند روز و هر بار چقدر وقت داری که به ورزش اختصاص بدی؟' },
  { id: 'equipment', section: 2, label: 'اگه قراره تو خونه تمرین کنی، چه وسایلی دم دست داری؟', hint: 'اگر وسیله‌ای نداری یا در باشگاه تمرین می‌کنی، همین رو بنویس.' },
  { id: 'allergies', section: 3, label: 'به ماده غذایی خاصی آلرژی یا حساسیت داری؟' },
  { id: 'dislikes', section: 3, label: 'چه غذاهایی رو اصلاً دوست نداری و ترجیح میدی تو برنامه‌ت نباشن؟' },
  { id: 'favorites', section: 3, label: 'غذاهای سنتی و خوشمزه‌ای که تو خونه‌تون بیشتر پخته میشه و دوست داری حتماً تو برنامه‌ت بمونه چیان؟' },
  { id: 'supplements', section: 3, label: 'در حال حاضر مکمل ورزشی یا ویتامینی مصرف می‌کنی؟' },
  { id: 'habits', section: 3, label: 'عادت غذایی خاصی داری که بخوای در جریان باشم؟' },
].map((question, index) => ({ type: 'textarea', maxLength: 1800, ...question, optional: question.section !== 0, number: index + 1 }));

const normalizeDigits = (text) => text.replace(/[۰-۹٠-٩]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩'.indexOf(digit) % 10));

export function validateAnswers(answers, section) {
  const errors = {};
  for (const question of questions.filter((item) => section === undefined || item.section === section)) {
    const answer = String(answers[question.id] || '').trim();
    if (!answer && !question.optional) errors[question.id] = 'جواب این سؤال رو بنویس.';
    else if (answer.length > question.maxLength) errors[question.id] = `جوابت رو کوتاه‌تر کن؛ حداکثر ${question.maxLength} حرف.`;
    else if (question.options && answer && !question.options.includes(answer)) errors[question.id] = 'یکی از گزینه‌ها رو انتخاب کن.';
    else if (question.id === 'age' && (!/^\d{1,3}$/.test(normalizeDigits(answer)) || +normalizeDigits(answer) < 1 || +normalizeDigits(answer) > 120)) errors.age = 'سنت رو بین ۱ تا ۱۲۰ سال وارد کن.';
    else if (question.id === 'height' && parseMeasurement(answer, 70, 270) === null) errors.height = 'قدت رو بین ۷۰ و ۲۷۰ سانتی‌متر وارد کن.';
    else if (question.id === 'weight' && parseMeasurement(answer, 15, 650) === null) errors.weight = 'وزنت رو بین ۱۵ و ۶۵۰ کیلوگرم وارد کن.';
    else if (question.id === 'contact' && !validateContact('نام', 'phone', answer).value && !validateContact('نام', 'instagram', answer).value) errors.contact = 'شماره موبایل معتبر یا آیدی اینستاگرامت رو وارد کن.';
  }
  return errors;
}

export function validatePhoto(file) {
  if (!file) return '';
  if (!['image/jpeg', 'image/png'].includes(file.type)) return 'عکس رو با فرمت JPG یا PNG انتخاب کن.';
  if (!file.size || file.size > 5 * 1024 * 1024) return 'حجم هر عکس باید بیشتر از صفر و حداکثر ۵ مگابایت باشه.';
  return '';
}

export function answerText(question, answers, photos) {
  if (question.id === 'photos') {
    const attached = photoSlots.filter((slot) => photos[slot.id]).map((slot) => slot.label);
    return [answers.photos || 'پاسخی داده نشده', attached.length ? `عکس‌های پیوست: ${attached.join('، ')}` : 'بدون عکس پیوست'].join(' · ');
  }
  return String(answers[question.id] || '').trim();
}

// Keep whole question/answer pairs together and leave room for the message header.
export function buildMessages(answers, photos, reference) {
  const chunks = [];
  let chunk = '';
  for (const question of questions) {
    const pair = `?: ${question.label}-> ${answerText(question, answers, photos)}`;
    if ((chunk + '\n\n' + pair).length > 3400 && chunk) {
      chunks.push(chunk);
      chunk = '';
    }
    chunk += (chunk ? '\n\n' : '') + pair;
  }
  if (chunk) chunks.push(chunk);
  return chunks.map((text, index) => `پرسشنامه رکسانا\nشناسه: ${reference}\nبخش ${index + 1} از ${chunks.length}\n\n${text}`);
}
