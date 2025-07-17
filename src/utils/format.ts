export function formatMoney(val: number | null): string {
  if (val === null || isNaN(val)) return '--';
  return '$' + Math.floor(val).toLocaleString();
}

// Форматирует дату в формате 'DD MMM' (например, '12 Jan')
export function formatDate(date: string|number|Date): string {
  let dateObj: Date;
  if (typeof date === 'string') {
    // если строка вида "12 Jan" — конвертим в ISO
    if (/^\d{1,2}\s[A-Za-z]{3}$/.test(date)) {
      dateObj = new Date(parseShortDate(date));
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }
  if (isNaN(dateObj.getTime())) return '';
  const d = dateObj.getDate().toString().padStart(2,'0');
  const m = dateObj.toLocaleString('en', { month: 'short' });
  return `${d} ${m}`;
}
// Форматирует время в формате 'HH:mm' или '12:00 AM/PM'
export function formatTime(time: string|number|Date): string {
  // если это уже строка вида "HH:mm" — парсим вручную
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    const [h,mm] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 || 12;
    return `${hh}:${mm.toString().padStart(2,'0')} ${period}`;
  }
  // иначе пробуем new Date()
  const dateObj = new Date(time as any);
  if (isNaN(dateObj.getTime())) return '';
  const h = dateObj.getHours();
  const mm = dateObj.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${mm.toString().padStart(2,'0')} ${period}`;
}
// Форматирует дату и время в виде 'DD MMM, HH:mm AM/PM'
export function formatDateTime(date: string | number | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
} 

export function toISODateString(dateStr: string): string {
  // Преобразует "2024-07-01 12:00" в "2024-07-01T12:00"
  if (typeof dateStr === 'string' && dateStr.includes(' ')) {
    return dateStr.replace(' ', 'T');
  }
  return dateStr;
}

export function parseShortDate(str: string): string {
  const [day, mon] = str.split(' ');
  const monthMap: Record<string,string> = {
    Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12'
  };
  const mm = monthMap[mon];
  if (!mm) throw new Error(`Unknown month "${mon}"`);
  const yyyy = new Date().getFullYear();
  return `${yyyy}-${mm}-${day.padStart(2,'0')}`;
}