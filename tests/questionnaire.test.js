import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { answerText, buildMessages, detailMaxLength, hasDetails, OTHER_OPTION, questions, selectedOptions, toggleOption, validateAnswers, validatePhoto } from '../lib/questionnaire.js';
import { sendQuestionnaire, validBaleConfig } from '../lib/questionnaire-delivery.js';

const config = { token: '123456:test_token', chatIds: ['123', '456'] };
const answers = Object.fromEntries(questions.filter((question) => !question.optional).map((question) => [question.id, question.options?.[0] || 'ندارم']));
Object.assign(answers, { name: 'نمونه آزمایشی', age: '۶۱', height: '١٧٦', weight: '۸۰٫۵', contact: '۰۹۱۲۳۴۵۶۷۸۹' });

test('all 23 questions remain available; only the first section is required', () => {
  assert.equal(questions.length, 23);
  assert.deepEqual(questions.filter((question) => !question.optional).map((question) => question.id), ['name', 'age', 'gender', 'height', 'weight', 'contact']);
  assert.ok(questions.filter((question) => question.section > 0).every((question) => question.optional));
  assert.deepEqual(validateAnswers(answers), {});
  assert.equal(Object.keys(validateAnswers({})).length, 6);
  assert.equal(Object.keys(validateAnswers({}, 0)).length, 6);
});

test('later sections accept missing or blank answers, but validate answers when provided', () => {
  for (const section of [1, 2, 3]) {
    assert.deepEqual(validateAnswers({}, section), {});
  }
  const blanks = Object.fromEntries(questions.filter((question) => question.optional).map((question) => [question.id, '   ']));
  assert.deepEqual(validateAnswers({ ...answers, ...blanks }), {});
  assert.deepEqual(Object.keys(validateAnswers({ ...answers, location: 'invalid', occupation: 'x'.repeat(1801) })), ['occupation', 'location']);
});

test('Persian/Arabic numerals, decimal measurements, contact and invalid boundaries', () => {
  assert.deepEqual(validateAnswers({ ...answers, age: '١٢٠', contact: '@test.user' }), {});
  assert.deepEqual(Object.keys(validateAnswers({ ...answers, age: '۱۲۱', height: '۲۷۱', weight: '۰', contact: 'bad contact' })), ['age', 'height', 'weight', 'contact']);
  assert.ok(validateAnswers({ ...answers, occupation: 'x'.repeat(1801) }).occupation);
  assert.ok(validateAnswers({ ...answers, gender: 'invalid' }).gender);
});

test('long answers are all preserved, in order, within message limits', () => {
  const long = { ...answers };
  for (const question of questions.filter((item) => item.section > 0)) {
    const value = (field) => ({ selected: field.type === 'multi' ? [...field.options.filter((option) => !field.exclusiveOptions?.includes(option))] : [field.options.includes(OTHER_OPTION) ? OTHER_OPTION : field.options[0]],
      ...(field.options.includes(OTHER_OPTION) ? { other: 'ت'.repeat(detailMaxLength) } : {}),
      ...(field.detailLabel ? { details: 'ج'.repeat(detailMaxLength) } : {}),
    });
    if (question.type === 'groups') long[question.id] = Object.fromEntries(question.groups.map((group) => [group.id, value(group)]));
    else if (question.type === 'multi') long[question.id] = value(question);
    else if (question.options.includes(OTHER_OPTION)) long[question.id] = { ...value(question), selected: [OTHER_OPTION] };
  }
  assert.deepEqual(validateAnswers(long), {});
  const messages = buildMessages(long, {}, 'RX-test');
  assert.ok(messages.length > 5);
  assert.ok(messages.every((message) => message.length < 4096 && message.includes('RX-test')));
  const combined = messages.join('\n');
  let previous = -1;
  for (const question of questions) {
    const pair = `?: ${question.label}-> ${answerText(question, long, {})}`;
    const position = combined.indexOf(pair);
    assert.ok(position > previous, question.id);
    previous = position;
  }
});

test('every question after personal information has choices; compound questions retain both parts', () => {
  assert.ok(questions.filter((question) => question.section > 0).every((question) =>
    ['choice', 'multi', 'groups', 'photos'].includes(question.type)));
  for (const id of ['occupation', 'sleep', 'availability']) {
    assert.equal(questions.find((question) => question.id === id).groups.length, 2);
  }
});

test('multi-selection has no selection cap; exclusive answers clear incompatible answers and details', () => {
  const question = questions.find((question) => question.id === 'supplements');
  let value;
  for (const option of question.options.filter((option) => !question.exclusiveOptions.includes(option))) value = toggleOption(question, value, option);
  value = { ...value, other: 'مکمل دیگر', details: 'روزانه' };
  assert.equal(value.selected.length, question.options.length - 1);
  assert.deepEqual(validateAnswers({ ...answers, supplements: value }), {});
  assert.equal(hasDetails(question, value), true);
  value = toggleOption(question, value, question.exclusiveOptions[0]);
  assert.deepEqual(value, { selected: [question.exclusiveOptions[0]], other: '', details: '' });
  value = toggleOption(question, value, 'کراتین');
  assert.deepEqual(selectedOptions(value), ['کراتین']);
  value = toggleOption(question, value, 'کراتین');
  assert.deepEqual(value.selected, []);
});

test('single-selection replaces the previous choice and clears deselected other text', () => {
  const question = questions.find((question) => question.id === 'location');
  const value = toggleOption(question, { selected: [OTHER_OPTION], other: 'پارک' }, 'باشگاه');
  assert.deepEqual(value, { selected: ['باشگاه'], other: '', details: '' });
  assert.ok(validateAnswers({ ...answers, location: { selected: ['باشگاه', 'خانه'] } }).location);
});

test('other text is required only when selected; invalid selections, duplicates and hidden details are rejected', () => {
  assert.ok(validateAnswers({ ...answers, goal: { selected: [OTHER_OPTION], other: '  ' } }).goal);
  assert.deepEqual(validateAnswers({ ...answers, goal: { selected: [OTHER_OPTION], other: 'آمادگی برای کوهنوردی' } }), {});
  for (const value of [[], 42, { selected: ['نامعتبر'] }, { selected: ['کاهش وزن', 'کاهش وزن'] },
    { selected: ['کاهش وزن'], other: 'توضیح پنهان' }, { selected: [], details: 'توضیح پنهان' },
    { selected: [OTHER_OPTION], other: 42 }, { selected: [OTHER_OPTION], other: 'ت'.repeat(detailMaxLength + 1) }]) {
    assert.ok(validateAnswers({ ...answers, goal: value }).goal, JSON.stringify(value));
  }
  assert.ok(validateAnswers({ ...answers, conditions: { selected: ['بیماری شناخته‌شده‌ای ندارم', 'دیابت یا پیش‌دیابت'] } }).conditions);
});

test('compound choices validate and format each part without object coercion', () => {
  const question = questions.find((question) => question.id === 'sleep');
  const sleep = { hours: { selected: ['۷ تا کمتر از ۸ ساعت'] }, quality: { selected: [OTHER_OPTION], other: 'خواب سبک' } };
  assert.deepEqual(validateAnswers({ ...answers, sleep }), {});
  assert.equal(answerText(question, { sleep }, {}), 'مدت خواب در شبانه‌روز: ۷ تا کمتر از ۸ ساعت\nکیفیت خواب: سایر: خواب سبک');
  assert.ok(validateAnswers({ ...answers, sleep: { ...sleep, quality: { selected: [OTHER_OPTION] } } }).sleep);
  assert.ok(validateAnswers({ ...answers, sleep: 'متن آزاد قدیمی' }).sleep);
  assert.deepEqual(validateAnswers({ ...answers, sleep: {} }), {});
});

test('web-service messages include every selected option, other text and medication details for both recipients', async () => {
  const filled = { ...answers, goal: { selected: ['کاهش وزن', 'افزایش قدرت', OTHER_OPTION], other: 'آمادگی کوهنوردی' },
    medications: { selected: ['داروی تیروئید'], details: 'نام و مقدار نمونه' },
    availability: { days: { selected: ['۳ روز'] }, duration: { selected: ['۲۰ تا ۳۰ دقیقه'] } } };
  const calls = [];
  await sendQuestionnaire({ config, answers: filled, photos: {}, reference: 'RX-choices',
    fetchImpl: async (url, options) => { calls.push(options.body); return { type: 'opaque' }; } });
  for (const chatId of config.chatIds) {
    const text = calls.filter((body) => body.get('chat_id') === chatId).map((body) => body.get('text')).join('\n');
    for (const expected of ['کاهش وزن، افزایش قدرت، سایر: آمادگی کوهنوردی', 'توضیحات: نام و مقدار نمونه', 'تعداد روزهای تمرین در هفته: ۳ روز', 'زمان هر جلسه: ۲۰ تا ۳۰ دقیقه']) assert.ok(text.includes(expected), expected);
    assert.equal(text.includes('[object Object]'), false);
  }
});

test('optional photo validation rejects wrong format, zero bytes and oversized files', () => {
  assert.equal(validatePhoto(new File(['image'], 'body.jpg', { type: 'image/jpeg' })), '');
  assert.ok(validatePhoto(new File([], 'empty.png', { type: 'image/png' })));
  assert.ok(validatePhoto({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }));
  assert.ok(validatePhoto(new File(['text'], 'text.txt', { type: 'text/plain' })));
});

test('direct browser delivery sends full text and multipart photos to both BMI destinations', async () => {
  const calls = [];
  const photo = new File(['image'], 'private-name.png', { type: 'image/png' });
  const progress = [];
  const status = await sendQuestionnaire({ config, answers, photos: { front: photo }, reference: 'RX-test',
    fetchImpl: async (url, options) => { calls.push({ url, ...options }); return { type: 'opaque' }; },
    onProgress: (done, total) => progress.push([done, total]),
  });
  assert.equal(status, 'submitted');
  assert.equal(calls.length, 4);
  for (const id of config.chatIds) {
    const recipient = calls.filter((call) => call.body.get('chat_id') === id);
    assert.match(recipient[0].url, /\/sendMessage$/);
    assert.match(recipient[0].body.get('text'), /عادت‌ها یا محدودیت‌های غذایی/);
    assert.match(recipient[1].url, /\/sendPhoto$/);
    assert.equal(recipient[1].body.get('photo').name, 'front.png');
    assert.ok(recipient[1].body.get('caption').includes('RX-test'));
    assert.equal(recipient[1].headers, undefined);
  }
  assert.ok(calls.every((call) => call.method === 'POST' && call.mode === 'no-cors'));
  assert.deepEqual(progress.at(-1), [4, 4]);
});

test('network uncertainty stops that recipient without automatic retries', async () => {
  let calls = 0;
  const status = await sendQuestionnaire({ config, answers, photos: {}, reference: 'RX-test', fetchImpl: async () => { calls++; throw new Error('offline'); } });
  assert.equal(status, 'unknown');
  assert.equal(calls, 2);
  assert.equal(validBaleConfig({ ...config, chatIds: ['123', '123'] }), false);
  await assert.rejects(sendQuestionnaire({ config: { token: '', chatIds: [] }, answers, photos: {}, reference: 'RX-test', fetchImpl: async () => assert.fail('must not send') }), /not_configured/);
});

test('Vercel permits Bale on form routes and photo previews only on the questionnaire route', async () => {
  const settings = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const mainRule = settings.headers[0];
  const pattern = new RegExp(`^${mainRule.source}$`);
  assert.ok(pattern.test('/'));
  assert.ok(pattern.test('/assets/main.js'));
  assert.equal(pattern.test('/questionnaire/'), false);
  assert.equal(pattern.test('/questionnaire/index.html'), false);
  assert.equal(pattern.test('/assessment/'), false);
  assert.equal(pattern.test('/assessment/index.html'), false);
  assert.ok(!mainRule.headers[0].value.includes('tapi.bale.ai'));
  const policy = settings.headers[1].headers[0].value;
  assert.ok(policy.includes("connect-src 'self' https://tapi.bale.ai"));
  assert.ok(policy.includes("img-src 'self' blob:"));
  const assessmentRule = settings.headers.find((rule) => rule.source === '/assessment/:path*');
  assert.ok(assessmentRule.headers[0].value.includes("connect-src 'self' https://tapi.bale.ai"));
  assert.ok(!assessmentRule.headers[0].value.includes('blob:'));
});
