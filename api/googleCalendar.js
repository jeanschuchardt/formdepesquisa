const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';
const DEFAULT_WORK_START = '09:00';
const DEFAULT_WORK_END = '18:00';
const DEFAULT_SLOT_MINUTES = 30;
const DEFAULT_DAYS_AHEAD = 14;

export const calendarConfig = {
  calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE || DEFAULT_TIME_ZONE,
  workStart: process.env.GOOGLE_WORK_START || DEFAULT_WORK_START,
  workEnd: process.env.GOOGLE_WORK_END || DEFAULT_WORK_END,
  slotMinutes: Number(process.env.GOOGLE_SLOT_MINUTES || DEFAULT_SLOT_MINUTES),
  daysAhead: Number(process.env.GOOGLE_DAYS_AHEAD || DEFAULT_DAYS_AHEAD)
};

export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

export function getRequiredGoogleEnv() {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  return { missing };
}

export async function getAccessToken() {
  const { missing } = getRequiredGoogleEnv();

  if (missing.length > 0) {
    throw new Error(`Variaveis Google ausentes: ${missing.join(', ')}`);
  }

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const tokenPayload = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'Falha ao obter token');
  }

  return tokenPayload.access_token;
}

export async function googleCalendarRequest(path, options = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || 'Falha na chamada do Google Calendar');
  }

  return payload;
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function dateOnlyInTimeZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function localDateTimeToDate(date, time, timeZone) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000);
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return (asUtc - date.getTime()) / 60000;
}

export function isSlotFree(start, end, busyBlocks) {
  return busyBlocks.every((busy) => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);

    return end <= busyStart || start >= busyEnd;
  });
}

export async function getBusyBlocks(timeMin, timeMax) {
  const payload = await googleCalendarRequest('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: calendarConfig.timeZone,
      items: [{ id: calendarConfig.calendarId }]
    })
  });

  return payload.calendars?.[calendarConfig.calendarId]?.busy || [];
}
