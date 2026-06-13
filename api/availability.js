import {
  addMinutes,
  calendarConfig,
  dateOnlyInTimeZone,
  getBusyBlocks,
  isSlotFree,
  localDateTimeToDate,
  sendJson
} from './googleCalendar.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Metodo nao permitido' });
    return;
  }

  try {
    const today = dateOnlyInTimeZone(new Date(), calendarConfig.timeZone);
    const date = request.query.date || today;
    const startOfDay = localDateTimeToDate(date, '00:00', calendarConfig.timeZone);
    const endOfDay = addMinutes(startOfDay, 24 * 60);
    const busyBlocks = await getBusyBlocks(startOfDay, endOfDay);
    const workStart = localDateTimeToDate(date, calendarConfig.workStart, calendarConfig.timeZone);
    const workEnd = localDateTimeToDate(date, calendarConfig.workEnd, calendarConfig.timeZone);
    const now = new Date();
    const slots = [];

    for (
      let slotStart = workStart;
      addMinutes(slotStart, calendarConfig.slotMinutes) <= workEnd;
      slotStart = addMinutes(slotStart, calendarConfig.slotMinutes)
    ) {
      const slotEnd = addMinutes(slotStart, calendarConfig.slotMinutes);

      if (slotStart > now && isSlotFree(slotStart, slotEnd, busyBlocks)) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          label: new Intl.DateTimeFormat('pt-BR', {
            timeZone: calendarConfig.timeZone,
            hour: '2-digit',
            minute: '2-digit'
          }).format(slotStart)
        });
      }
    }

    sendJson(response, 200, {
      date,
      timeZone: calendarConfig.timeZone,
      slotMinutes: calendarConfig.slotMinutes,
      slots
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}
