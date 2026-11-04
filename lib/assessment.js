export const healthOptions = ['دیابت نوع ۲', 'فشار خون بالا', 'چربی خون بالا', 'وقفه تنفسی در خواب'];

const digits = '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩';
const bmiFormat = new Intl.NumberFormat('fa-IR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

function normalizeDigits(value) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => String(digits.indexOf(digit) % 10));
}

export function parseMeasurement(input, min, max) {
  if (typeof input !== 'string' || input.length > 12) return null;
  const text = normalizeDigits(input.trim()).replace(/[٫,]/g, '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text);
  if (value < min || value > max) return null;
  return Math.round(value * 100);
}

export function assess(height, weight) {
  const heightUnits = parseMeasurement(height, 70, 270);
  const weightUnits = parseMeasurement(weight, 15, 650);
  if (heightUnits === null || weightUnits === null) {
    return { invalidHeight: heightUnits === null, invalidWeight: weightUnits === null };
  }

  // Use unrounded BMI at the cutoff to keep the displayed result and next step consistent.
  const numerator = weightUnits * 1_000_000;
  const denominator = heightUnits ** 2;
  const bmi = numerator / denominator;
  const inRange = numerator >= 30 * denominator;
  const displayedBmi = !inRange && Math.round(bmi * 100) === 3000 ? 29.99 : bmi;
  return { bmi, inRange, display: bmiFormat.format(displayedBmi) };
}

export function validateContact(name, channel, value) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const validName = cleanName.length > 0 && cleanName.length <= 80
    && /^[\p{L}\p{M} .‌’'-]+$/u.test(cleanName)
    && /\p{L}/u.test(cleanName);

  if (typeof value !== 'string' || value.length > 40) {
    return { name: validName ? cleanName : null, value: null };
  }

  const cleanValue = normalizeDigits(value.trim());
  let validValue = null;
  if (channel === 'phone') {
    const phone = cleanValue.replace(/[\s()-]/g, '');
    if (/^(?:0|\+98|0098)9\d{9}$/.test(phone)) validValue = phone;
  } else if (channel === 'instagram') {
    const handle = cleanValue.replace(/^@/, '');
    if (/^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/.test(handle) && !handle.includes('..')) {
      validValue = '@' + handle;
    }
  }
  return { name: validName ? cleanName : null, value: validValue };
}
