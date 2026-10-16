// Reads a pasted M-Pesa confirmation SMS (the one the shop or the customer receives) and pulls out the
// transaction code, amount, payer, phone, date/time and account number. M-Pesa wording varies by message
// type (received from a person, Paybill/Till payment, customer's own "sent to" message), so each field is
// found on its own rather than with one fixed pattern.

const titleCase = (s) => s.toLowerCase().replace(/(^|[\s'-])\S/g, (m) => m.toUpperCase());

// 11/10/26 at 2:15 PM (Kenyan day/month/year) → ISO in Kenya time.
function parseWhen(text) {
  const m = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*(?:at\s*)?(\d{1,2}):(\d{2})\s*([AP]M)?/i);
  if (!m) return null;
  let [, d, mo, y, h, min, ap] = m;
  y = y.length === 2 ? `20${y}` : y;
  h = Number(h);
  if (ap) h = (h % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0);
  const iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${min}:00+03:00`;
  return Number.isNaN(Date.parse(iso)) ? null : new Date(iso).toISOString();
}

const money = (s) => Math.round(Number(s.replace(/,/g, '')) * 100);

export function parseMpesaMessage(raw) {
  const text = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 1500);
  if (!text) return null;

  // Transaction code: 10 letters/digits, usually right before "Confirmed".
  const codeMatch = text.match(/\b([A-Z0-9]{10})\b(?=\s*Confirmed)/i) ?? text.match(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])([A-Z0-9]{10})\b/);
  const code = codeMatch ? codeMatch[1].toUpperCase() : null;

  // The transaction amount is the first Ksh figure; balances and charges come later in the message.
  const amountMatch = text.match(/(?:Ksh|KES)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? money(amountMatch[1]) : null;

  const direction = /\breceived\b|\bfrom\b/i.test(text) && !/\bsent to\b|\bpaid to\b/i.test(text) ? 'received' : /\bsent to\b|\bpaid to\b/i.test(text) ? 'sent' : null;

  // Payer: the part after "from", up to " on <date>", a full stop, "New …" or "Account …".
  let payer = null;
  let phone = null;
  const fromPart = text.match(/\bfrom\s+(.+?)(?=\s+on\s+\d|\.\s|\.$|\s+New\s|\s+Account\b|\s+for\s+account|$)/i)?.[1];
  if (fromPart) {
    // Masked (2547***222, 0712***678) or full (0712345678, 254712345678).
    phone = fromPart.match(/\+?\d{1,6}\*+\d{2,4}|(?:\+?254|0)[17]\d{8}/)?.[0] ?? null;
    const name = fromPart.replace(phone ?? '', '').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();
    payer = name && /[A-Za-z]/.test(name) ? titleCase(name) : null;
  }
  const payee = text.match(/\b(?:sent to|paid to)\s+(.+?)(?=\s+for\s+account|\s+on\s+\d|\.\s|$)/i)?.[1]?.trim() ?? null;
  const account = text.match(/\b(?:for\s+account|account\s+(?:number|no\.?))\s*:?\s*([A-Z0-9-]+)/i)?.[1]?.toUpperCase() ?? null;

  return { code, amount, direction, payer, phone, payee, account, paidAt: parseWhen(text), text };
}

// Does an order's phone fit the phone in the message (full, or masked like 0712***678)?
export function phoneMatches(orderPhone, msgPhone) {
  if (!orderPhone || !msgPhone) return false;
  const local = (p) => p.replace(/[^\d*]/g, '').replace(/^254/, '0').replace(/^([17])/, '0$1');
  const a = local(orderPhone);
  const b = local(msgPhone);
  if (!b.includes('*')) return a === b;
  const [pre, post] = [b.slice(0, b.indexOf('*')), b.slice(b.lastIndexOf('*') + 1)];
  return a.startsWith(pre) && a.endsWith(post);
}

