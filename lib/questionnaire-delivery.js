import { buildMessages, photoSlots } from './questionnaire.js';

export function validBaleConfig({ token, chatIds }) {
  return Boolean(token && /^\d+:[A-Za-z0-9_-]+$/.test(token)
    && chatIds?.length === 2 && chatIds.every((id) => id && /^-?\d+$/.test(id))
    && new Set(chatIds).size === chatIds.length);
}

// Same direct browser transport as BMI. Opaque responses cannot confirm receipt.
export async function sendQuestionnaire({ config, answers, photos, reference, onProgress = () => {}, fetchImpl = fetch }) {
  if (!validBaleConfig(config)) throw new Error('not_configured');
  const messages = buildMessages(answers, photos, reference);
  const attachments = photoSlots.filter((slot) => photos[slot.id]);
  const total = config.chatIds.length * (messages.length + attachments.length);
  let completed = 0;
  const deliveries = await Promise.allSettled(config.chatIds.map(async (chatId) => {
    for (const text of messages) {
      await fetchImpl(`https://tapi.bale.ai/bot${config.token}/sendMessage`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(8_000),
      });
      onProgress(++completed, total);
    }
    for (const slot of attachments) {
      const body = new FormData();
      body.append('chat_id', chatId);
      body.append('caption', `پرسشنامه رکسانا | ${answers.name.trim()}\nشناسه: ${reference}\nعکس ${slot.label}`);
      body.append('photo', photos[slot.id], `${slot.id}.${photos[slot.id].type === 'image/png' ? 'png' : 'jpg'}`);
      await fetchImpl(`https://tapi.bale.ai/bot${config.token}/sendPhoto`, {
        method: 'POST', mode: 'no-cors', body, signal: AbortSignal.timeout(30_000),
      });
      onProgress(++completed, total);
    }
  }));
  return deliveries.every((delivery) => delivery.status === 'fulfilled') ? 'submitted' : 'unknown';
}
