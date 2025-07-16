// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://back.axylon.com',
  ENDPOINTS: {
    PRICES: '/prices',
    POSITIONS: '/positions',
    STATISTICS: '/positions_statistics'
  }
};

// Asset mapping for API calls
export const ASSET_MAPPING = {
  'Axylon\'s vault': 'Axylon',
  'Bitcoin': 'BTC',
  'Ethereum': 'ETH',
  'Hyperliquid': 'HYPE',
  'SP500': 'SP500',
  'Gold': 'GOLD'
} as const;

// Timeframe mapping for API calls
export const TIMEFRAME_MAPPING = {
  '1d': '15m',   // 15-minute intervals for 1 day
  '7d': '1h',    // 1-hour intervals for 7 days
  '30d': '4h',   // 4-hour intervals for 30 days
  'All': '24h'   // 24-hour intervals for all time
} as const;

// Assets that might not have data on non-trading days
export const NON_TRADING_ASSETS = ['SP500', 'GOLD']; 