export interface CompareOption {
  label: string;
  color: string;
}

export const compareOptions: CompareOption[] = [
  { label: 'Bitcoin', color: '#FF8A00' },
  { label: 'Ethereum', color: '#A3A3A3' },
  { label: 'Hyperliquid', color: '#00FFA6' },
  { label: 'SP500', color: '#0055FF' },
  { label: 'Gold', color: '#FFC300' },
];

export const timeframes = ['1d', '7d', '30d', 'All'] as const;
export type Timeframe = typeof timeframes[number];

export interface ChartComponentProps {
  data: any[];
  timeframe: Timeframe;
  selectedCurrencies: string[];
} 