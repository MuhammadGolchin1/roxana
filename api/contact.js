import { assess, healthOptions, validateContact } from '../lib/assessment.js';

function json(status, code) {
  return Response.json(code ? { ok: false, code } : { ok: true }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) ||
      request.headers.get('sec-fetch-site') === 'cross-site') {
    return json(403, 'invalid_origin');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return json(415, 'invalid_request');
  }

  let payload;
  try {
    const body = await request.text();
    if (body.length > 2048) return json(413, 'invalid_request');
    payload = JSON.parse(body);
  } catch {
    return json(400, 'invalid_request');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json(400, 'invalid_request');
  }

  const { name, value } = validateContact(payload.name, payload.channel, payload.contact);
  const result = assess(payload.height, payload.weight);
  if (!name || !value || result.invalidHeight || result.invalidWeight) {
    return json(400, 'invalid_request');
  }

  const health = payload.health ?? [];
  const healthDetail = payload.healthDetail ?? '';
  if (!Array.isArray(health) || health.length > healthOptions.length + 1 ||
      health.some((item) => typeof item !== 'string' ||
        (item !== 'other' && !healthOptions.includes(item))) ||
      new Set(health).size !== health.length ||
      typeof healthDetail !== 'string' || healthDetail.length > 250 ||
      (healthDetail.trim() && !health.includes('other'))) {
    return json(400, 'invalid_request');
  }

  const token = process.env.BALE_BOT_TOKEN?.trim();
  const chatId = process.env.BALE_CHAT_ID?.trim();
  const chatId2 = process.env.BALE_CHAT_ID2?.trim();
  const chatIds = [chatId, chatId2];
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token) ||
      chatIds.some((id) => !id || !/^-?\d+$/.test(id)) ||
      new Set(chatIds).size !== chatIds.length) {
    return json(503, 'not_configured');
  }

  const channelLabel = payload.channel === 'phone' ? 'موبایل' : 'اینستاگرام';
  const healthLabels = health.map((item) => (
    item === 'other' ? `مورد دیگه${healthDetail.trim() ? `: ${healthDetail.trim()}` : ''}` : item
  ));
  const message = [
    'درخواست پیگیری روکسانا',
    'نام: ' + name,
    channelLabel + ': ' + value,
    'BMI: ' + result.display,
    'مشکلات سلامتی: ' + (healthLabels.length ? healthLabels.join('، ') : 'ذکر نشده'),
    `نتیجه: ${result.inRange ? 'در محدوده بررسی اولیه' : 'خارج از محدوده بررسی اولیه'}`,
  ].join('\n');

  const deliveries = await Promise.all(chatIds.map(async (id, index) => {
    try {
      const response = await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text: message }),
        redirect: 'error',
        signal: AbortSignal.timeout(8_000),
      });
      const result = await response.json().catch(() => null);
      const delivered = response.ok && result?.ok === true;
      if (!delivered) {
        console.error('Bale message delivery failed', {
          recipient: index + 1,
          status: response.status,
          errorCode: Number.isInteger(result?.error_code) ? result.error_code : undefined,
          description: typeof result?.description === 'string'
            ? result.description.slice(0, 200)
            : undefined,
        });
      }
      return {
        delivered,
        rateLimited: response.status === 429,
        unknown: false,
      };
    } catch {
      console.error('Bale message delivery outcome is unknown (network error or timeout)', {
        recipient: index + 1,
      });
      return { delivered: false, rateLimited: false, unknown: true };
    }
  }));

  const deliveredCount = deliveries.filter((delivery) => delivery.delivered).length;
  if (deliveredCount === chatIds.length) return json(200);
  if (deliveredCount > 0) return json(502, 'delivery_partial');
  if (deliveries.every((delivery) => delivery.rateLimited)) return json(429, 'rate_limited');
  if (deliveries.some((delivery) => delivery.unknown)) return json(504, 'delivery_unknown');
  return json(502, 'delivery_failed');
}
