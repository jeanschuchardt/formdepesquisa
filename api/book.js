import {
  addMinutes,
  calendarConfig,
  getBusyBlocks,
  googleCalendarRequest,
  isSlotFree,
  sendJson
} from './googleCalendar.js';

async function readBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Metodo nao permitido' });
    return;
  }

  try {
    const body = await readBody(request);
    const start = new Date(body.start);

    if (!body.start || Number.isNaN(start.getTime())) {
      sendJson(response, 400, { error: 'Horario invalido' });
      return;
    }

    if (!body.name || !body.email) {
      sendJson(response, 400, { error: 'Nome e e-mail sao obrigatorios para agendar' });
      return;
    }

    const end = addMinutes(start, calendarConfig.slotMinutes);
    const busyBlocks = await getBusyBlocks(start, end);

    if (!isSlotFree(start, end, busyBlocks)) {
      sendJson(response, 409, { error: 'Esse horario acabou de ficar indisponivel' });
      return;
    }

    const event = await googleCalendarRequest(
      `/calendars/${encodeURIComponent(calendarConfig.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: 'POST',
        body: JSON.stringify({
          summary: `Sessao gratuita - ${body.name}`,
          description: [
            `Nome: ${body.name}`,
            `E-mail: ${body.email}`,
            body.whatsapp ? `WhatsApp: ${body.whatsapp}` : null
          ]
            .filter(Boolean)
            .join('\n'),
          start: {
            dateTime: start.toISOString(),
            timeZone: calendarConfig.timeZone
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: calendarConfig.timeZone
          },
          attendees: [{ email: body.email, displayName: body.name }],
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        })
      }
    );

    sendJson(response, 200, {
      eventId: event.id,
      htmlLink: event.htmlLink,
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}
