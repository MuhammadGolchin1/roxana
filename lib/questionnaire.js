import { parseMeasurement, validateContact } from './assessment.js';

export const sections = [
  { title: 'بیا آشنا بشیم', short: 'آشنایی', description: 'اطلاعات اولیه‌ت رو وارد کن تا بتونیم باهات در ارتباط باشیم.' },
  { title: 'هدفت و حال بدنت', short: 'هدف و سلامت', description: 'این جواب‌ها کمک می‌کنن حال بدنت و نیاز‌هات رو بهتر بشناسیم.' },
  { title: 'ورزش توی زندگی تو', short: 'تمرین', description: 'بگو چقدر وقت داری و چه امکاناتی دم دستته تا برنامه با زندگی روزمره‌ت جور باشه.' },
  { title: 'سلیقه و عادت‌های غذایی', short: 'تغذیه', description: 'بگو چه غذاهایی دوست داری و چه عادت‌های غذایی‌ای داری.' },
];

export const photoSlots = [
  { id: 'front', label: 'روبه‌رو' },
  { id: 'side', label: 'پهلو' },
  { id: 'back', label: 'پشت' },
];

export const OTHER_OPTION = 'سایر';
export const detailMaxLength = 1000;

export const questions = [
  { id: 'name', section: 0, label: 'دوست داری چی صدات کنیم؟', type: 'text', maxLength: 80, autoComplete: 'name', placeholder: 'مثلاً رکسانا' },
  { id: 'age', section: 0, label: 'چند سالته؟', type: 'number', maxLength: 3, placeholder: 'مثلاً ۳۲', unit: 'سال' },
  { id: 'gender', section: 0, label: 'جنسیتت چیه؟', type: 'choice', options: ['خانم', 'آقا', 'سایر', 'ترجیح می‌دم نگم'] },
  { id: 'height', section: 0, label: 'قدت چقدره؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۱۶۵', unit: 'سانتی‌متر' },
  { id: 'weight', section: 0, label: 'وزنت چقدره؟', type: 'number', maxLength: 12, placeholder: 'مثلاً ۷۰٫۵', unit: 'کیلوگرم' },
  { id: 'contact', section: 0, label: 'شمارهٔ موبایل یا آیدی اینستاگرامت', type: 'text', maxLength: 40, placeholder: '09123456789 / @username', hint: 'یکی از این دو تا کافیه. از همین راه باهات در ارتباط می‌مونیم.' },
  { id: 'occupation', section: 1, label: 'شغلت چیه و روزها چقدر تحرک داری؟', type: 'groups', groups: [
    { id: 'job', label: 'شغلت', type: 'choice', options: ['کارمند یا کار اداری', 'کار آزاد یا فروشندگی', 'کار فنی یا بدنی', 'کادر درمان', 'معلم یا مدرس', 'دانشجو یا دانش‌آموز', 'خانه‌دار', 'بازنشسته', 'الان شاغل نیستم', OTHER_OPTION] },
    { id: 'activity', label: 'تحرکت به‌جز تمرین', type: 'choice', options: ['بیشتر روز نشسته‌م', 'تقریباً به یه اندازه می‌شینم و می‌ایستم', 'بیشتر روز سر پام یا راه می‌رم', 'کار بدنی سنگین دارم', 'تحرکم هر روز فرق می‌کنه'] },
  ] },
  { id: 'goal', section: 1, label: 'توی این دوره می‌خوای به چه هدف‌هایی برسی؟', type: 'multi', options: ['کاهش وزن', 'کاهش چربی بدن', 'افزایش وزن', 'عضله‌سازی', 'فرم‌دهی بدن', 'افزایش قدرت', 'افزایش استقامت', 'بهبود انعطاف‌پذیری', 'بهبود آمادگی و حال عمومی', 'تثبیت وزن', 'ساختن عادت ورزشی و غذایی منظم', OTHER_OPTION] },
  { id: 'conditions', section: 1, label: 'بیماری خاصی داری که لازمه موقع بررسی برنامه در نظر بگیریم؟', type: 'multi', options: ['تا جایی که می‌دونم بیماری خاصی ندارم', 'دیابت یا پیش‌دیابت', 'فشار خون بالا', 'بیماری قلبی یا عروقی', 'کم‌کاری تیروئید', 'پرکاری تیروئید', 'تخمدان پلی‌کیستیک', 'کم‌خونی', 'آسم یا مشکل تنفسی', 'مشکل گوارشی', 'بیماری کلیوی', 'بیماری کبدی', 'پوکی استخوان', 'مطمئن نیستم', 'ترجیح می‌دم نگم', OTHER_OPTION], exclusiveOptions: ['تا جایی که می‌دونم بیماری خاصی ندارم', 'مطمئن نیستم', 'ترجیح می‌دم نگم'] },
  { id: 'medications', section: 1, label: 'الان چه داروهایی مصرف می‌کنی؟', type: 'multi', options: ['دارویی مصرف نمی‌کنم', 'داروی تیروئید', 'داروی دیابت یا قند خون', 'داروی فشار خون', 'داروی قلب یا رقیق‌کنندهٔ خون', 'داروی اعصاب یا روان‌پزشکی', 'داروی هورمونی یا ضدبارداری', 'کورتون', 'مسکن یا ضدالتهاب', 'داروی گوارشی', 'داروی تنفسی یا آلرژی', 'ترجیح می‌دم نگم', OTHER_OPTION], exclusiveOptions: ['دارویی مصرف نمی‌کنم', 'ترجیح می‌دم نگم'], detailLabel: 'اسم داروها و مقدار مصرفشون (اختیاری)' },
  { id: 'pain', section: 1, label: 'کجای بدنت درد مفصلی یا اسکلتی داری؟', type: 'multi', options: ['دردی ندارم', 'گردن', 'شانه', 'آرنج', 'مچ یا دست', 'پشت یا کمر', 'لگن یا مفصل ران', 'زانو', 'مچ پا یا کف پا', OTHER_OPTION], exclusiveOptions: ['دردی ندارم'], detailLabel: 'شدت درد و حرکت‌هایی که اذیتت می‌کنن (اختیاری)' },
  { id: 'injuries', section: 1, label: 'تا حالا آسیب‌دیدگی ورزشی یا جراحی داشتی؟', type: 'multi', options: ['سابقه‌ای ندارم', 'آسیب عضله یا تاندون', 'آسیب رباط یا منیسک', 'شکستگی یا دررفتگی', 'آسیب ستون فقرات یا دیسک', 'جراحی مفصل یا استخوان', 'جراحی شکم یا لگن', 'جراحی قلب یا قفسهٔ سینه', OTHER_OPTION], exclusiveOptions: ['سابقه‌ای ندارم'], detailLabel: 'کجا و کی آسیب دیدی یا جراحی کردی و الان چه محدودیتی داری؟ (اختیاری)' },
  { id: 'sleep', section: 1, label: 'چقدر می‌خوابی و کیفیت خوابت چطوره؟', type: 'groups', groups: [
    { id: 'hours', label: 'مدت خواب در شبانه‌روز', type: 'choice', options: ['کمتر از ۵ ساعت', '۵ تا کمتر از ۶ ساعت', '۶ تا کمتر از ۷ ساعت', '۷ تا کمتر از ۸ ساعت', '۸ تا ۹ ساعت', 'بیشتر از ۹ ساعت', 'ساعت خوابم ثابت نیست'] },
    { id: 'quality', label: 'کیفیت خواب', type: 'choice', options: ['خوب؛ معمولاً سرحال بیدار می‌شم', 'متوسط؛ گاهی خسته بیدار می‌شم', 'ضعیف؛ معمولاً خسته‌م یا چند بار بیدار می‌شم', 'برای خوابیدن مشکل دارم', 'به خاطر شیفت کاری خوابم نامنظمه', OTHER_OPTION] },
  ] },
  { id: 'photos', section: 1, label: 'دوست داری برای بررسی فرم بدنت، با لباس ورزشی از روبه‌رو، پهلو و پشت عکس بفرستی؟ (اختیاری)', type: 'photos', optional: true, options: ['الان عکس‌ها رو اضافه می‌کنم', 'بعداً می‌فرستم', 'دوست ندارم عکس بفرستم'] },
  { id: 'experience', section: 2, label: 'چقدر سابقهٔ ورزش داری؟', type: 'choice', options: ['تا حالا منظم ورزش نکردم', 'تازه شروع کردم؛ کمتر از ۳ ماه', '۳ ماه تا کمتر از ۱ سال تمرین منظم', '۱ تا ۳ سال تمرین منظم', 'بیشتر از ۳ سال تمرین منظم', 'قبلاً ورزش می‌کردم ولی یه مدته فاصله گرفتم', OTHER_OPTION], detailLabel: 'چه ورزش‌هایی کردی و چقدر سابقه داری؟ (اختیاری)' },
  { id: 'location', section: 2, label: 'ترجیح می‌دی کجا تمرین کنی؟', type: 'choice', options: ['خونه', 'باشگاه', 'هر دو', 'فضای باز', 'هنوز تصمیم نگرفتم', OTHER_OPTION] },
  { id: 'availability', section: 2, label: 'هفته‌ای چند روز و هر بار چقدر برای تمرین وقت داری؟', type: 'groups', groups: [
    { id: 'days', label: 'تعداد روزهای تمرین در هفته', type: 'choice', options: ['۱ روز', '۲ روز', '۳ روز', '۴ روز', '۵ روز', '۶ روز', '۷ روز', 'برنامه‌م هر هفته فرق می‌کنه'] },
    { id: 'duration', label: 'زمان هر جلسه', type: 'choice', options: ['کمتر از ۲۰ دقیقه', '۲۰ تا ۳۰ دقیقه', 'بیشتر از ۳۰ تا ۴۵ دقیقه', 'بیشتر از ۴۵ تا ۶۰ دقیقه', 'بیشتر از ۶۰ تا ۹۰ دقیقه', 'بیشتر از ۹۰ دقیقه', 'زمان ثابتی ندارم', OTHER_OPTION] },
  ] },
  { id: 'equipment', section: 2, label: 'برای تمرین توی خونه چه وسایلی دم دستت داری؟', type: 'multi', options: ['وسیله‌ای ندارم', 'فقط توی باشگاه تمرین می‌کنم', 'مت یا زیرانداز', 'دمبل', 'هالتر و وزنه', 'کش مقاومتی', 'کش تی‌آر‌ایکس (TRX)', 'کتل‌بل', 'نیمکت', 'بارفیکس', 'طناب', 'توپ ورزشی', 'تردمیل', 'دوچرخهٔ ثابت', 'دستگاه چندکاره', OTHER_OPTION], exclusiveOptions: ['وسیله‌ای ندارم', 'فقط توی باشگاه تمرین می‌کنم'] },
  { id: 'allergies', section: 3, label: 'به چه غذاهایی آلرژی یا حساسیت داری؟', type: 'multi', options: ['تا جایی که می‌دونم حساسیت خاصی ندارم', 'شیر یا لبنیات', 'تخم‌مرغ', 'گندم یا گلوتن', 'بادام‌زمینی', 'مغزها مثل گردو یا بادام', 'ماهی', 'میگو یا غذاهای دریایی', 'سویا', 'کنجد', 'مطمئن نیستم', OTHER_OPTION], exclusiveOptions: ['تا جایی که می‌دونم حساسیت خاصی ندارم', 'مطمئن نیستم'], detailLabel: 'نوع حساسیت یا عدم تحملت و شدت واکنشت رو بگو (اختیاری)' },
  { id: 'dislikes', section: 3, label: 'چه غذاهایی رو دوست نداری و می‌خوای توی برنامه‌ت نباشن؟', type: 'multi', options: ['غذای خاصی نیست', 'گوشت قرمز', 'مرغ', 'ماهی یا غذاهای دریایی', 'تخم‌مرغ', 'شیر', 'ماست یا پنیر', 'حبوبات', 'قارچ', 'بادمجان', 'کلم یا بروکلی', 'سبزی خام یا سالاد', 'غذاهای تند', 'جگر و دل‌وقلوه', OTHER_OPTION], exclusiveOptions: ['غذای خاصی نیست'] },
  { id: 'favorites', section: 3, label: 'دوست داری کدوم غذاهای خونگی توی برنامه‌ت بمونن؟', type: 'multi', options: ['قورمه‌سبزی', 'قیمه', 'فسنجان', 'خورش بادمجان', 'زرشک‌پلو با مرغ', 'عدس‌پلو', 'لوبیاپلو', 'باقالی‌پلو', 'سبزی‌پلو با ماهی', 'کباب', 'آبگوشت', 'کشک بادمجان', 'میرزاقاسمی', 'کتلت یا کوکو', 'آش', 'سوپ', 'عدسی یا خوراک لوبیا', 'املت', 'ترجیح خاصی ندارم', OTHER_OPTION], exclusiveOptions: ['ترجیح خاصی ندارم'] },
  { id: 'supplements', section: 3, label: 'الان چه مکمل ورزشی یا ویتامینی مصرف می‌کنی؟', type: 'multi', options: ['مکملی مصرف نمی‌کنم', 'پروتئین وی یا پروتئین گیاهی', 'کراتین', 'گینر', 'آمینواسید یا BCAA', 'مکمل قبل تمرین', 'مولتی‌ویتامین', 'ویتامین D', 'ویتامین‌های گروه B', 'ویتامین C', 'آهن', 'کلسیم', 'منیزیم', 'زینک', 'امگا ۳', 'چربی‌سوز', OTHER_OPTION], exclusiveOptions: ['مکملی مصرف نمی‌کنم'], detailLabel: 'اسم مکمل‌ها و اینکه کی و چقدر مصرفشون می‌کنی (اختیاری)' },
  { id: 'habits', section: 3, label: 'عادت یا محدودیت غذایی خاصی داری؟', type: 'multi', options: ['عادت یا محدودیت خاصی ندارم', 'گیاه‌خوارم', 'وگان هستم', 'روزه‌داری متناوب دارم', 'وعده‌ها رو نامنظم می‌خورم', 'صبحانه نمی‌خورم', 'شام رو دیر می‌خورم', 'ریزه‌خواری دارم', 'وقتی استرس دارم یا ناراحتم بیشتر غذا می‌خورم', 'شیرینی خیلی دوست دارم', 'نوشابه یا نوشیدنی شیرین زیاد می‌خورم', 'فست‌فود یا غذای بیرون زیاد می‌خورم', 'آب کم می‌خورم', 'چای یا قهوه زیاد می‌خورم', 'به خاطر شیفت کاری وقت غذام ثابت نیست', OTHER_OPTION], exclusiveOptions: ['عادت یا محدودیت خاصی ندارم'] },
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
  if (typeof value !== 'string' && (typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.selected))) return 'این جواب معتبر نیست؛ دوباره از بین گزینه‌ها انتخاب کن.';
  const selected = selectedOptions(value);
  if (selected.some((option) => !question.options.includes(option)) || new Set(selected).size !== selected.length
      || (question.type !== 'multi' && selected.length > 1)) return 'از بین گزینه‌های همین سؤال انتخاب کن.';
  if (selected.length > 1 && selected.some((option) => question.exclusiveOptions?.includes(option))) return 'گزینهٔ «ندارم» یا جواب مشابه رو به‌تنهایی انتخاب کن.';
  for (const key of ['other', 'details']) {
    if (value?.[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > detailMaxLength)) return 'توضیحت رو به‌صورت متن و تا ۱۰۰۰ حرف بنویس.';
  }
  if (question.options.includes(OTHER_OPTION) && selected.includes(OTHER_OPTION) && !value?.other?.trim()) return 'برای گزینهٔ «سایر» یه توضیح بنویس.';
  if (value?.other?.trim() && !selected.includes(OTHER_OPTION)) return 'برای ثبت این توضیح، گزینهٔ «سایر» رو انتخاب کن.';
  if (value?.details?.trim() && !hasDetails(question, value)) return 'اول گزینه‌ای رو که به توضیحت مربوطه انتخاب کن.';
  return '';
}

export function validateAnswers(answers, section) {
  const errors = {};
  for (const question of questions.filter((item) => section === undefined || item.section === section)) {
    if (question.type === 'groups') {
      const value = answers[question.id];
      if (value == null || (typeof value === 'string' && !value.trim())) continue;
      if (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some((key) => !question.groups.some((group) => group.id === key))) {
        errors[question.id] = 'این جواب معتبر نیست؛ دوباره از بین گزینه‌ها انتخاب کن.';
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
      else if (!question.optional && !selectedOptions(answers[question.id]).length) errors[question.id] = 'جواب این سؤال رو انتخاب کن.';
      continue;
    }
    const answer = String(answers[question.id] || '').trim();
    if (!answer && !question.optional) errors[question.id] = 'جواب این سؤال رو بنویس.';
    else if (answer.length > question.maxLength) errors[question.id] = `جوابت رو کوتاه‌تر کن؛ تا ${question.maxLength.toLocaleString('fa-IR', { useGrouping: false })} حرف.`;
    else if (question.id === 'age' && (!/^\d{1,3}$/.test(normalizeDigits(answer)) || +normalizeDigits(answer) < 1 || +normalizeDigits(answer) > 120)) errors.age = 'سنت رو بین ۱ تا ۱۲۰ سال وارد کن.';
    else if (question.id === 'height' && parseMeasurement(answer, 70, 270) === null) errors.height = 'قدت رو بین ۷۰ و ۲۷۰ سانتی‌متر وارد کن.';
    else if (question.id === 'weight' && parseMeasurement(answer, 15, 650) === null) errors.weight = 'وزنت رو بین ۱۵ و ۶۵۰ کیلوگرم وارد کن.';
    else if (question.id === 'contact' && !validateContact('نام', 'phone', answer).value && !validateContact('نام', 'instagram', answer).value) errors.contact = 'یه شمارهٔ موبایل معتبر یا آیدی اینستاگرامت رو وارد کن.';
  }
  return errors;
}

export function validatePhoto(file) {
  if (!file) return '';
  if (!['image/jpeg', 'image/png'].includes(file.type)) return 'عکس رو با فرمت JPG یا PNG انتخاب کن.';
  if (!file.size || file.size > 5 * 1024 * 1024) return 'حجم هر عکس باید بیشتر از صفر و تا ۵ مگابایت باشه.';
  return '';
}

export function answerText(question, answers, photos) {
  if (question.id === 'photos') {
    const attached = photoSlots.filter((slot) => photos[slot.id]).map((slot) => slot.label);
    return [answers.photos || 'جوابی ندادی', attached.length ? `عکس‌هایی که اضافه کردی: ${attached.join('، ')}` : 'عکسی اضافه نکردی'].join(' · ');
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
