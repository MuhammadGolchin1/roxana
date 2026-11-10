import { parseMeasurement, validateContact } from './assessment.js';

export const sections = [
  { title: 'با هم آشنا شویم', short: 'آشنایی', description: 'اطلاعات اولیه را وارد کنید تا بتوانیم با شما در ارتباط باشیم.' },
  { title: 'هدف‌ها و وضعیت سلامت', short: 'هدف و سلامت', description: 'این پاسخ‌ها به شناخت شرایط بدنی و نیازهای شما کمک می‌کنند.' },
  { title: 'ورزش در زندگی شما', short: 'تمرین', description: 'زمان و امکانات تمرین خود را مشخص کنید تا برنامه با زندگی روزمرهٔ شما هماهنگ باشد.' },
  { title: 'سلیقه و عادت‌های غذایی', short: 'تغذیه', description: 'غذاهای دلخواه و عادت‌های غذایی خود را مشخص کنید.' },
];

export const photoSlots = [
  { id: 'front', label: 'روبه‌رو' },
  { id: 'side', label: 'پهلو' },
  { id: 'back', label: 'پشت' },
];

export const OTHER_OPTION = 'سایر';
export const detailMaxLength = 1000;

export const questions = [
  { id: 'name', section: 0, label: 'نامی که دوست دارید با آن خطاب شوید', type: 'text', maxLength: 80, autoComplete: 'name', placeholder: 'مثلاً رکسانا' },
  { id: 'age', section: 0, label: 'چند سال دارید؟', type: 'number', maxLength: 3, placeholder: 'مثلاً ۳۲', unit: 'سال' },
  { id: 'gender', section: 0, label: 'جنسیت خود را مشخص کنید', type: 'choice', options: ['خانم', 'آقا', 'سایر', 'ترجیح می‌دهم نگویم'] },
  { id: 'height', section: 0, label: 'قد شما چقدر است؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۱۶۵', unit: 'سانتی‌متر' },
  { id: 'weight', section: 0, label: 'وزن شما چقدر است؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۷۰٫۵', unit: 'کیلوگرم' },
  { id: 'contact', section: 0, label: 'شمارهٔ موبایل یا شناسهٔ اینستاگرام', type: 'text', maxLength: 40, placeholder: '09123456789 / @username', hint: 'واردکردن یکی از این دو کافی است. از همین راه با شما در ارتباط خواهیم بود.' },
  { id: 'occupation', section: 1, label: 'شغل شما چیست و در طول روز چقدر تحرک دارید؟', type: 'groups', groups: [
    { id: 'job', label: 'وضعیت شغلی', type: 'choice', options: ['کارمند یا کار اداری', 'کار آزاد یا فروشندگی', 'کار فنی یا بدنی', 'کادر درمان', 'معلم یا مدرس', 'دانشجو یا دانش‌آموز', 'خانه‌دار', 'بازنشسته', 'در حال حاضر شاغل نیستم', OTHER_OPTION] },
    { id: 'activity', label: 'تحرک روزانه خارج از تمرین', type: 'choice', options: ['بیشتر روز نشسته‌ام', 'نشستن و ایستادن تقریباً برابر است', 'بیشتر روز ایستاده‌ام یا راه می‌روم', 'کار بدنی سنگین دارم', 'میزان تحرکم هر روز متفاوت است'] },
  ] },
  { id: 'goal', section: 1, label: 'در این دوره می‌خواهید به چه هدف‌هایی برسید؟', type: 'multi', options: ['کاهش وزن', 'کاهش چربی بدن', 'افزایش وزن', 'عضله‌سازی', 'فرم‌دهی بدن', 'افزایش قدرت', 'افزایش استقامت', 'بهبود انعطاف‌پذیری', 'بهبود آمادگی و حال عمومی', 'تثبیت وزن', 'ساختن عادت ورزشی و غذایی منظم', OTHER_OPTION] },
  { id: 'conditions', section: 1, label: 'آیا بیماری خاصی دارید که لازم است در بررسی برنامه در نظر بگیریم؟', type: 'multi', options: ['بیماری شناخته‌شده‌ای ندارم', 'دیابت یا پیش‌دیابت', 'فشار خون بالا', 'بیماری قلبی یا عروقی', 'کم‌کاری تیروئید', 'پرکاری تیروئید', 'تخمدان پلی‌کیستیک', 'کم‌خونی', 'آسم یا مشکل تنفسی', 'مشکل گوارشی', 'بیماری کلیوی', 'بیماری کبدی', 'پوکی استخوان', 'اطمینان ندارم', 'ترجیح می‌دهم نگویم', OTHER_OPTION], exclusiveOptions: ['بیماری شناخته‌شده‌ای ندارم', 'اطمینان ندارم', 'ترجیح می‌دهم نگویم'] },
  { id: 'medications', section: 1, label: 'در حال حاضر چه داروهایی مصرف می‌کنید؟', type: 'multi', options: ['دارویی مصرف نمی‌کنم', 'داروی تیروئید', 'داروی دیابت یا قند خون', 'داروی فشار خون', 'داروی قلب یا رقیق‌کنندهٔ خون', 'داروی اعصاب یا روان‌پزشکی', 'داروی هورمونی یا ضدبارداری', 'کورتون', 'مسکن یا ضدالتهاب', 'داروی گوارشی', 'داروی تنفسی یا آلرژی', 'ترجیح می‌دهم نگویم', OTHER_OPTION], exclusiveOptions: ['دارویی مصرف نمی‌کنم', 'ترجیح می‌دهم نگویم'], detailLabel: 'نام داروها و مقدار مصرف آن‌ها (اختیاری)' },
  { id: 'pain', section: 1, label: 'در کدام قسمت‌های بدن درد مفصلی یا اسکلتی دارید؟', type: 'multi', options: ['دردی ندارم', 'گردن', 'شانه', 'آرنج', 'مچ یا دست', 'پشت یا کمر', 'لگن یا مفصل ران', 'زانو', 'مچ پا یا کف پا', OTHER_OPTION], exclusiveOptions: ['دردی ندارم'], detailLabel: 'شدت درد و حرکت‌هایی که باعث ناراحتی می‌شوند (اختیاری)' },
  { id: 'injuries', section: 1, label: 'آیا سابقهٔ آسیب‌دیدگی ورزشی یا جراحی دارید؟', type: 'multi', options: ['سابقه‌ای ندارم', 'آسیب عضله یا تاندون', 'آسیب رباط یا منیسک', 'شکستگی یا دررفتگی', 'آسیب ستون فقرات یا دیسک', 'جراحی مفصل یا استخوان', 'جراحی شکم یا لگن', 'جراحی قلب یا قفسهٔ سینه', OTHER_OPTION], exclusiveOptions: ['سابقه‌ای ندارم'], detailLabel: 'محل و زمان آسیب یا جراحی و محدودیت فعلی (اختیاری)' },
  { id: 'sleep', section: 1, label: 'مدت و کیفیت خواب شما چطور است؟', type: 'groups', groups: [
    { id: 'hours', label: 'مدت خواب در شبانه‌روز', type: 'choice', options: ['کمتر از ۵ ساعت', '۵ تا کمتر از ۶ ساعت', '۶ تا کمتر از ۷ ساعت', '۷ تا کمتر از ۸ ساعت', '۸ تا ۹ ساعت', 'بیشتر از ۹ ساعت', 'ساعت خوابم ثابت نیست'] },
    { id: 'quality', label: 'کیفیت خواب', type: 'choice', options: ['خوب؛ معمولاً سرحال بیدار می‌شوم', 'متوسط؛ گاهی خسته بیدار می‌شوم', 'ضعیف؛ معمولاً خسته‌ام یا چند بار بیدار می‌شوم', 'برای خوابیدن مشکل دارم', 'به‌دلیل شیفت کاری خواب نامنظم دارم', OTHER_OPTION] },
  ] },
  { id: 'photos', section: 1, label: 'آیا مایلید برای بررسی فرم بدن، عکس‌هایی از روبه‌رو، پهلو و پشت با لباس ورزشی بفرستید؟ (اختیاری)', type: 'photos', optional: true, options: ['اکنون عکس‌ها را اضافه می‌کنم', 'بعداً می‌فرستم', 'تمایلی ندارم'] },
  { id: 'experience', section: 2, label: 'چقدر سابقهٔ تمرین ورزشی دارید؟', type: 'choice', options: ['تاکنون منظم ورزش نکرده‌ام', 'تازه شروع کرده‌ام؛ کمتر از ۳ ماه', '۳ ماه تا کمتر از ۱ سال تمرین منظم', '۱ تا ۳ سال تمرین منظم', 'بیشتر از ۳ سال تمرین منظم', 'قبلاً ورزش می‌کردم، اما مدتی فاصله گرفته‌ام', OTHER_OPTION], detailLabel: 'رشته‌های ورزشی و مدت سابقه (اختیاری)' },
  { id: 'location', section: 2, label: 'ترجیح می‌دهید کجا تمرین کنید؟', type: 'choice', options: ['خانه', 'باشگاه', 'هر دو', 'فضای باز', 'هنوز تصمیم نگرفته‌ام', OTHER_OPTION] },
  { id: 'availability', section: 2, label: 'چند روز در هفته و هر بار چقدر برای تمرین وقت دارید؟', type: 'groups', groups: [
    { id: 'days', label: 'تعداد روزهای تمرین در هفته', type: 'choice', options: ['۱ روز', '۲ روز', '۳ روز', '۴ روز', '۵ روز', '۶ روز', '۷ روز', 'برنامه‌ام هر هفته متفاوت است'] },
    { id: 'duration', label: 'زمان هر جلسه', type: 'choice', options: ['کمتر از ۲۰ دقیقه', '۲۰ تا ۳۰ دقیقه', 'بیشتر از ۳۰ تا ۴۵ دقیقه', 'بیشتر از ۴۵ تا ۶۰ دقیقه', 'بیشتر از ۶۰ تا ۹۰ دقیقه', 'بیشتر از ۹۰ دقیقه', 'زمان ثابتی ندارم', OTHER_OPTION] },
  ] },
  { id: 'equipment', section: 2, label: 'برای تمرین در خانه چه وسایلی در دسترس دارید؟', type: 'multi', options: ['وسیله‌ای ندارم', 'فقط در باشگاه تمرین می‌کنم', 'مت یا زیرانداز', 'دمبل', 'هالتر و وزنه', 'کش مقاومتی', 'کش تی‌آر‌ایکس (TRX)', 'کتل‌بل', 'نیمکت', 'بارفیکس', 'طناب', 'توپ ورزشی', 'تردمیل', 'دوچرخهٔ ثابت', 'دستگاه چندکاره', OTHER_OPTION], exclusiveOptions: ['وسیله‌ای ندارم', 'فقط در باشگاه تمرین می‌کنم'] },
  { id: 'allergies', section: 3, label: 'به کدام مواد غذایی آلرژی یا حساسیت دارید؟', type: 'multi', options: ['حساسیت شناخته‌شده‌ای ندارم', 'شیر یا لبنیات', 'تخم‌مرغ', 'گندم یا گلوتن', 'بادام‌زمینی', 'مغزها مثل گردو یا بادام', 'ماهی', 'میگو یا غذاهای دریایی', 'سویا', 'کنجد', 'اطمینان ندارم', OTHER_OPTION], exclusiveOptions: ['حساسیت شناخته‌شده‌ای ندارم', 'اطمینان ندارم'], detailLabel: 'نوع حساسیت یا عدم تحمل و شدت واکنش (اختیاری)' },
  { id: 'dislikes', section: 3, label: 'ترجیح می‌دهید کدام غذاها در برنامهٔ شما نباشند؟', type: 'multi', options: ['غذای خاصی نیست', 'گوشت قرمز', 'مرغ', 'ماهی یا غذاهای دریایی', 'تخم‌مرغ', 'شیر', 'ماست یا پنیر', 'حبوبات', 'قارچ', 'بادمجان', 'کلم یا بروکلی', 'سبزی خام یا سالاد', 'غذاهای تند', 'جگر و دل‌وقلوه', OTHER_OPTION], exclusiveOptions: ['غذای خاصی نیست'] },
  { id: 'favorites', section: 3, label: 'دوست دارید کدام غذاهای خانگی در برنامهٔ شما بمانند؟', type: 'multi', options: ['قورمه‌سبزی', 'قیمه', 'فسنجان', 'خورش بادمجان', 'زرشک‌پلو با مرغ', 'عدس‌پلو', 'لوبیاپلو', 'باقالی‌پلو', 'سبزی‌پلو با ماهی', 'کباب', 'آبگوشت', 'کشک بادمجان', 'میرزاقاسمی', 'کتلت یا کوکو', 'آش', 'سوپ', 'عدسی یا خوراک لوبیا', 'املت', 'ترجیح خاصی ندارم', OTHER_OPTION], exclusiveOptions: ['ترجیح خاصی ندارم'] },
  { id: 'supplements', section: 3, label: 'در حال حاضر چه مکمل‌های ورزشی یا ویتامینی مصرف می‌کنید؟', type: 'multi', options: ['مکملی مصرف نمی‌کنم', 'پروتئین وی یا پروتئین گیاهی', 'کراتین', 'گینر', 'آمینواسید یا BCAA', 'مکمل قبل تمرین', 'مولتی‌ویتامین', 'ویتامین D', 'ویتامین‌های گروه B', 'ویتامین C', 'آهن', 'کلسیم', 'منیزیم', 'زینک', 'امگا ۳', 'چربی‌سوز', OTHER_OPTION], exclusiveOptions: ['مکملی مصرف نمی‌کنم'], detailLabel: 'نام مکمل‌ها، مقدار و زمان مصرف (اختیاری)' },
  { id: 'habits', section: 3, label: 'چه عادت‌ها یا محدودیت‌های غذایی دارید؟', type: 'multi', options: ['عادت یا محدودیت خاصی ندارم', 'گیاه‌خوارم', 'وگان هستم', 'روزه‌داری متناوب دارم', 'وعده‌ها را نامنظم می‌خورم', 'صبحانه نمی‌خورم', 'شام دیرهنگام می‌خورم', 'ریزه‌خواری دارم', 'هنگام استرس یا ناراحتی بیشتر غذا می‌خورم', 'میل زیادی به شیرینی دارم', 'نوشابه یا نوشیدنی شیرین زیاد می‌خورم', 'فست‌فود یا غذای بیرون زیاد می‌خورم', 'آب کم می‌خورم', 'چای یا قهوه زیاد می‌خورم', 'به‌دلیل شیفت کاری زمان غذایم متغیر است', OTHER_OPTION], exclusiveOptions: ['عادت یا محدودیت خاصی ندارم'] },
].map((question, index) => ({ type: 'textarea', maxLength: 1800, ...question, optional: question.section !== 0, number: index + 1 }));

const normalizeDigits = (text) => text.replace(/[۰-۹٠-٩]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩'.indexOf(digit) % 10));

export function selectedOptions(value) {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  return Array.isArray(value?.selected) ? value.selected : [];
}

export function hasDetails(question, value) {
  const selected = selectedOptions(value);
  return Boolean(question.detailLabel && selected.some((option) => !question.exclusiveOptions?.includes(option)));
}

export function toggleOption(question, value, option) {
  const selected = selectedOptions(value);
  let next;
  if (question.type !== 'multi') next = [option];
  else if (selected.includes(option)) next = selected.filter((item) => item !== option);
  else if (question.exclusiveOptions?.includes(option)) next = [option];
  else next = [...selected.filter((item) => !question.exclusiveOptions?.includes(item)), option];
  return {
    selected: next,
    other: next.includes(OTHER_OPTION) ? value?.other || '' : '',
    details: hasDetails(question, { selected: next }) ? value?.details || '' : '',
  };
}

function choiceText(question, value) {
  const selected = selectedOptions(value);
  const text = selected.map((option) => option === OTHER_OPTION && value?.other?.trim()
    ? `${OTHER_OPTION}: ${value.other.trim()}` : option).join('، ');
  return [text, hasDetails(question, value) && value?.details?.trim() ? `توضیحات: ${value.details.trim()}` : ''].filter(Boolean).join('\n');
}

function validateChoice(question, value) {
  if (value == null || (typeof value === 'string' && !value.trim())) return '';
  if (typeof value !== 'string' && (typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.selected))) return 'گزینه‌های پاسخ معتبر نیستند.';
  const selected = selectedOptions(value);
  if (selected.some((option) => !question.options.includes(option)) || new Set(selected).size !== selected.length
      || (question.type !== 'multi' && selected.length > 1)) return 'از گزینه‌های همین سؤال انتخاب کنید.';
  if (selected.length > 1 && selected.some((option) => question.exclusiveOptions?.includes(option))) return 'گزینهٔ «ندارم» یا پاسخ مشابه را به‌تنهایی انتخاب کنید.';
  for (const key of ['other', 'details']) {
    if (value?.[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > detailMaxLength)) return 'توضیحات باید متن و حداکثر ۱۰۰۰ حرف باشد.';
  }
  if (question.options.includes(OTHER_OPTION) && selected.includes(OTHER_OPTION) && !value?.other?.trim()) return 'برای گزینهٔ «سایر» توضیح بنویسید.';
  if (value?.other?.trim() && !selected.includes(OTHER_OPTION)) return 'برای ثبت این توضیح، گزینهٔ «سایر» را انتخاب کنید.';
  if (value?.details?.trim() && !hasDetails(question, value)) return 'ابتدا گزینهٔ مرتبط با توضیحات را انتخاب کنید.';
  return '';
}

export function validateAnswers(answers, section) {
  const errors = {};
  for (const question of questions.filter((item) => section === undefined || item.section === section)) {
    if (question.type === 'groups') {
      const value = answers[question.id];
      if (value == null || (typeof value === 'string' && !value.trim())) continue;
      if (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some((key) => !question.groups.some((group) => group.id === key))) {
        errors[question.id] = 'گزینه‌های پاسخ معتبر نیستند.';
        continue;
      }
      for (const group of question.groups) {
        const error = validateChoice(group, value[group.id]);
      if (error) { errors[question.id] = `${group.label}: ${error}`; break; }
      }
      continue;
    }
    if (question.options) {
      const error = validateChoice(question, answers[question.id]);
      if (error) errors[question.id] = error;
      else if (!question.optional && !selectedOptions(answers[question.id]).length) errors[question.id] = 'پاسخ این سؤال را انتخاب کنید.';
      continue;
    }
    const answer = String(answers[question.id] || '').trim();
    if (!answer && !question.optional) errors[question.id] = 'پاسخ این سؤال را بنویسید.';
    else if (answer.length > question.maxLength) errors[question.id] = `پاسخ را کوتاه‌تر کنید؛ حداکثر ${question.maxLength.toLocaleString('fa-IR', { useGrouping: false })} حرف.`;
    else if (question.id === 'age' && (!/^\d{1,3}$/.test(normalizeDigits(answer)) || +normalizeDigits(answer) < 1 || +normalizeDigits(answer) > 120)) errors.age = 'سن را بین ۱ تا ۱۲۰ سال وارد کنید.';
    else if (question.id === 'height' && parseMeasurement(answer, 70, 270) === null) errors.height = 'قد را بین ۷۰ و ۲۷۰ سانتی‌متر وارد کنید.';
    else if (question.id === 'weight' && parseMeasurement(answer, 15, 650) === null) errors.weight = 'وزن را بین ۱۵ و ۶۵۰ کیلوگرم وارد کنید.';
    else if (question.id === 'contact' && !validateContact('نام', 'phone', answer).value && !validateContact('نام', 'instagram', answer).value) errors.contact = 'شمارهٔ موبایل معتبر یا شناسهٔ اینستاگرام را وارد کنید.';
  }
  return errors;
}

export function validatePhoto(file) {
  if (!file) return '';
  if (!['image/jpeg', 'image/png'].includes(file.type)) return 'عکس را با قالب JPG یا PNG انتخاب کنید.';
  if (!file.size || file.size > 5 * 1024 * 1024) return 'حجم هر عکس باید بیشتر از صفر و حداکثر ۵ مگابایت باشد.';
  return '';
}

export function answerText(question, answers, photos) {
  if (question.id === 'photos') {
    const attached = photoSlots.filter((slot) => photos[slot.id]).map((slot) => slot.label);
    return [answers.photos || 'پاسخی داده نشده', attached.length ? `عکس‌های پیوست: ${attached.join('، ')}` : 'بدون عکس پیوست'].join(' · ');
  }
  if (question.type === 'groups') return question.groups.map((group) => {
    const text = choiceText(group, answers[question.id]?.[group.id]);
    return text ? `${group.label}: ${text}` : '';
  }).filter(Boolean).join('\n');
  if (question.options) return choiceText(question, answers[question.id]);
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
  return chunks.map((text, index) => `پرسشنامهٔ رکسانا\nشناسه: ${reference}\nبخش ${(index + 1).toLocaleString('fa-IR')} از ${chunks.length.toLocaleString('fa-IR')}\n\n${text}`);
}
