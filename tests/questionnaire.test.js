import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { answerText, buildMessages, questions, validateAnswers, validatePhoto } from '../lib/questionnaire.js';
import { sendQuestionnaire, validBaleConfig } from '../lib/questionnaire-delivery.js';

const config = { token: '123456:test_token', chatIds: ['123', '456'] };
const answers = Object.fromEntries(questions.filter((question) => !question.optional).map((question) => [question.id, question.options?.[0] || 'ندارم']));
Object.assign(answers, { name: 'نمونه آزمایشی', age: '۶۱', height: '١٧٦', weight: '۸۰٫۵', contact: '۰۹۱۲۳۴۵۶۷۸۹' });

test('all 23 questions are ordered; only photos are optional', () => {
  assert.equal(questions.length, 23);
  assert.deepEqual(questions.filter((question) => question.optional).map((question) => question.id), ['photos']);
  assert.deepEqual(validateAnswers(answers), {});
  assert.equal(Object.keys(validateAnswers({})).length, 22);
  assert.equal(Object.keys(validateAnswers({}, 0)).length, 6);
});

test('Persian/Arabic numerals, decimal measurements, contact and invalid boundaries', () => {
  assert.deepEqual(validateAnswers({ ...answers, age: '١٢٠', contact: '@test.user' }), {});
  assert.deepEqual(Object.keys(validateAnswers({ ...answers, age: '۱۲۱', height: '۲۷۱', weight: '۰', contact: 'bad contact' })), ['age', 'height', 'weight', 'contact']);
  assert.ok(validateAnswers({ ...answers, occupation: 'x'.repeat(1801) }).occupation);
  assert.ok(validateAnswers({ ...answers, gender: 'invalid' }).gender);
});

test('long answers are all preserved, in order, within message limits', () => {
  const long = { ...answers };
  for (const question of questions.filter((item) => item.type === 'textarea')) long[question.id] = `${question.id}: ` + 'ت'.repeat(1700);
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
    assert.match(recipient[0].body.get('text'), /عادت غذایی خاصی/);
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

test('Vercel permits Bale and photo previews only on the questionnaire route', async () => {
  const settings = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const mainRule = settings.headers[0];
  const pattern = new RegExp(`^${mainRule.source}$`);
  assert.ok(pattern.test('/'));
  assert.ok(pattern.test('/assets/main.js'));
  assert.equal(pattern.test('/questionnaire/'), false);
  assert.equal(pattern.test('/questionnaire/index.html'), false);
  assert.ok(!mainRule.headers[0].value.includes('tapi.bale.ai'));
  const policy = settings.headers[1].headers[0].value;
  assert.ok(policy.includes("connect-src 'self' https://tapi.bale.ai"));
  assert.ok(policy.includes("img-src 'self' blob:"));
});
