import { formatDate, formatTime } from './format';

export const getXAxisLabels = (data: any[], tf: string): string[] => {
  const n = 7;
  if (data.length === 0) return [];

  // Индексы: первый, равномерно между, последний
  const indexes = [0];
  if (data.length > 1) {
    for (let i = 1; i < n - 1; i++) {
      indexes.push(Math.round(i * (data.length - 1) / (n - 1)));
    }
    indexes.push(data.length - 1);
  }

  // Убираем дубли индексов (если мало данных)
  const uniqueIndexes = Array.from(new Set(indexes));

  if (tf === '1d') {
    // Форматируем как HH:mm
    return uniqueIndexes.map(i => {
      const t = data[i]?.name;
      if (!t) return '';
      if (/^\d{2}:\d{2}$/.test(t)) return formatTime(t);
      const [h, m] = t.split(':').map(Number);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    });
  }

  // Для остальных таймфреймов — формат DD MMM
  return uniqueIndexes.map(i => {
    const d = data[i]?.date || data[i]?.name;
    if (!d) return '';
    return formatDate(d);
  });
};

export const getTicks = (data: any[], tf: string): string[] => {
  if (tf === '7d' || tf === '30d') {
    return Array.from(new Set(data.map(d => d.date))).filter(Boolean);
  }
  
  if (tf === '1d') {
    // Для 1d возвращаем 7 равномерно распределённых значений времени
    const n = 7;
    const unique = Array.from(new Set(data.map(d => d.name)));
    const step = (unique.length - 1) / (n - 1);
    return Array.from({ length: n }, (_, i) => unique[Math.round(i * step)]).filter(Boolean);
  }

  if (tf === 'All') {
    // Если данных больше 90 дней, группируем по месяцам
    if (data.length > 90) {
      return Array.from(new Set(data.map(d => d.date))).filter(Boolean);
    }
    // Иначе показываем все даты
    return data.map(d => d.name).filter(Boolean);
  }
  
  return data.map(d => d.name).filter(Boolean);
}; 