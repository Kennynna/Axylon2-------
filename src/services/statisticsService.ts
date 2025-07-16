import { API_CONFIG } from '../config/api';

interface StatisticsItem {
  coin: string;
  TotalPNL?: number;
  num_positions?: number;
  total_value?: number;
  Fees?: number;
}

type StatisticsFlag = 'top_netpnl' | 'top_num_trades' | 'top_volume' | 'top_fees';

const COLORS = [
  '#FF8A00', // Orange (BTC)
  '#9A9A9A', // Gray (ETH)
  '#00FFA6', // Green (HYPE)
  '#A259FF', // Purple
  '#F5F5F5', // White
  '#FF0080', // Pink
  '#00CFFF', // Cyan
  '#FFD600', // Yellow
  '#1790FF', // Blue
  '#FF5C5C', // Red
  '#00E676', // Light Green
  '#FFB300', // Amber
  '#FF6F00', // Deep Orange
  '#8D33FF', // Violet
  '#33FFF3', // Turquoise
  '#FF33A8', // Magenta
  '#33FF57', // Light Green 2
  '#3366FF', // Blue 2
  '#FF3333', // Red 2
  '#B3FF33', // Lime
  '#A15CE7', // (SOL, custom color, но пусть будет в палитре для совместимости)
];

export const getStatistics = async (flag: StatisticsFlag): Promise<StatisticsItem[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/positions_statistics?flag=${flag}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
};

export const formatStatisticsData = (data: StatisticsItem[], flag: StatisticsFlag) => {
  if (!data.length) return [];

  // Карта кастомных цветов для тикеров
  const CUSTOM_COLORS: Record<string, string> = {
    BTC: '#FF8A00',
    ETH: '#9A9A9A',
    HYPE: '#00FFA6',
    SOL: '#A15CE7',
  };
  // Массив цветов без кастомных
  const CUSTOM_COLOR_VALUES = Object.values(CUSTOM_COLORS).map(c => c.toLowerCase());
  const RANDOM_COLORS = COLORS.filter(c => !CUSTOM_COLOR_VALUES.includes(c.toLowerCase()));

  // Функция перемешивания массива (Fisher-Yates)
  function shuffleArray(array: string[]): string[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const shuffledColors = shuffleArray(RANDOM_COLORS);

  const total = data.reduce((sum, item) => {
    let value = 0;
    switch (flag) {
      case 'top_netpnl':
        value = Math.abs(item.TotalPNL || 0);
        break;
      case 'top_num_trades':
        value = Math.abs(item.num_positions || 0);
        break;
      case 'top_volume':
        value = Math.abs(item.total_value || 0);
        break;
      case 'top_fees':
        value = Math.abs(item.Fees || 0);
        break;
    }
    return sum + value;
  }, 0);

  return data.map((item, index) => {
    let value = 0;
    let actualValue = 0;
    let color = CUSTOM_COLORS[item.coin] || shuffledColors[index % shuffledColors.length];

    switch (flag) {
      case 'top_netpnl':
        value = Math.abs(item.TotalPNL || 0);
        actualValue = item.TotalPNL || 0;
        break;
      case 'top_num_trades':
        value = Math.abs(item.num_positions || 0);
        actualValue = item.num_positions || 0;
        break;
      case 'top_volume':
        value = Math.abs(item.total_value || 0);
        actualValue = item.total_value || 0;
        break;
      case 'top_fees':
        value = Math.abs(item.Fees || 0);
        actualValue = -(item.Fees || 0); // Invert fees
        break;
    }

    const percentage = total === 0 ? 0 : (value / total) * 100;

    // Format the display value based on the flag
    let formattedValue = '';
    switch (flag) {
      case 'top_netpnl':
        formattedValue = `$${Math.abs(actualValue).toFixed(0)}`;
        break;
      case 'top_num_trades':
        formattedValue = Math.round(actualValue).toString();
        break;
      case 'top_volume':
        formattedValue = `$${Math.abs(actualValue).toFixed(0)}`;
        break;
      case 'top_fees':
        formattedValue = `$${Math.abs(actualValue).toFixed(2)}`;
        break;
    }

    // Add minus sign for negative values where applicable
    if ((flag === 'top_netpnl' || flag === 'top_fees' || flag === 'top_volume') && actualValue < 0) {
      formattedValue = '-' + formattedValue;
    }

    return {
      name: item.coin,
      value: percentage,
      usd: formattedValue,
      color,
      actualValue
    };
  });
};

export const FLAG_MAP: Record<string, StatisticsFlag> = {
  'Net P&L': 'top_netpnl',
  'Fees': 'top_fees',
  'Volume': 'top_volume',
  'Trades': 'top_num_trades'
}; 