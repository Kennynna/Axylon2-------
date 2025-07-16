// Интерфейс для данных с API
interface ApiTradeHistoryItem {
  start_time: string;
  end_time: string;
  coin: string;
  direction: string;
  total_sz: number;
  avg_entry_price: number;
  total_value: number;
  PnL: number;
  Fees: number;
  fundingFee: number;
  TotalPNL: number;
}

// Интерфейс для форматированных данных
export interface TradeHistoryItem {
  openTime: {
    date: string;
    time: string;
  };
  closeTime: {
    date: string;
    time: string;
  };
  asset: string;
  direction: string;
  quantity: string;
  entry: string;
  tradeValue: string;
  pnl: number;
  fees: string;
  funding: string;
  netPnl: number;
}

// Функция для форматирования даты
function formatDate(dateStr: string): { date: string; time: string } {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'short' });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return {
    date: `${day} ${month} ${year}`,
    time: `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  };
}

// Функция для форматирования чисел
function formatNumber(num: number): string {
  const [int, dec] = num.toFixed(2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec ? '.' + dec : '');
}

// Функция для форматирования денежных значений
function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const [int, dec] = abs.toFixed(2).split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec ? '.' + dec : '');
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

// Функция для получения и форматирования данных
export async function getTradeHistory(): Promise<TradeHistoryItem[]> {
  try {
    const response = await fetch('https://back.axylon.com/positions_history');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiTradeHistoryItem[] = await response.json();
    
    return data.map(item => ({
      openTime: formatDate(item.start_time),
      closeTime: formatDate(item.end_time),
      asset: item.coin,
      direction: item.direction.replace('Open ', ''), // Remove 'Open ' prefix
      quantity: formatNumber(item.total_sz),
      entry: formatMoney(item.avg_entry_price),
      tradeValue: formatMoney(item.total_value),
      pnl: item.PnL, // Оставляем как число для цветового форматирования
      fees: formatMoney(item.Fees),
      funding: formatMoney(item.fundingFee),
      netPnl: item.TotalPNL, // Оставляем как число для цветового форматирования
    }));
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return [];
  }
} 