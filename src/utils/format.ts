export function formatMoney(val: number | null): string {
  if (val === null || isNaN(val)) return '--';
  return '$' + Math.floor(val).toLocaleString();
}

// Форматирует дату в формате 'DD MMM' (например, '12 Jan')
export function formatDate(date: string | number | Date): string {
  try {
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('en', { month: 'short' });
    return `${day} ${month}`;
  } catch {
    return String(date);
  }
}

// Форматирует время в формате 'HH:mm' или '12:00 AM/PM'
export function formatTime(time: string | number | Date): string {
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    // Входная строка типа '14:30'
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  try {
    const dateObj = new Date(time);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return String(time);
  }
}

// Форматирует дату и время в виде 'DD MMM, HH:mm AM/PM'
export function formatDateTime(date: string | number | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
} 