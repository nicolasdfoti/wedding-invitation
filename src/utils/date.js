export function formatDate(date, locale = 'es-AR', options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString(locale, defaultOptions);
}

export function formatTime(date, locale = 'es-AR', options = {}) {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  };
  return new Date(date).toLocaleTimeString(locale, defaultOptions);
}

export function getTimeUntil(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function generateICS(event) {
  const { title, description, location, startDate, endDate, url } = event;

  const formatICSDate = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sofy & Nico//Boda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sofyynico.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}\\n\\n${url || ''}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

export function downloadICS(event, filename = 'boda-sofy-nico.ics') {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}