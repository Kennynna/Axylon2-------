import 'styled-components';

export interface ThemeType {
  background: string;
  card: string;
  cardAlt: string;
  text: string;
  textSecondary: string;
  textAccent: string;
  border: string;
  error: string;
  success: string;
  headerBg: string;
  footerBg: string;
  buttonBg: string;
  buttonText: string;
  icon: string;
  metricCardBg: string;
  metricCardValue: string;
  infoCardBg: string;
  infoCardValue: string;
  mainChartBg: string;
  timeframeFilterBg: string;
  timeframeFilterText: string;
  dropdownMenuBg: string;
  pieChartBg: string;
  pieChartText: string;
  positionsTableBg: string;
  positionsTableHeaderBg: string;
  positionsTableHeaderText: string;
  positionsTableCellText: string;
  positionsTableBorder: string;
  positionsTableButtonBg: string;
  positionsTableButtonText: string;
  faqOverlayBg: string;
  faqWindowBg: string;
  faqTitleBg: string;
  faqTitleText: string;
  faqQuestion: string;
  faqAnswer: string;
  faqWrapperBg: string;
  zeroValueColor: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}

export const colors = {
  primary: '#C9184A',
  background: {
    main: '#202020',
    secondary: '#1A1A1A',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
    tertiary: '#9A9A9A',
  },
  chart: {
    bitcoin: '#FF8A00',
    ethereum: '#A3A3A3',
    hyperliquid: '#00FFA6',
    sp500: '#0055FF',
    gold: '#FFC300',
  },
} as const;

export const shadows = {
  light: '0 2px 8px rgba(0,0,0,0.04)',
  medium: '0 2px 8px rgba(0,0,0,0.10)',
} as const;

export const typography = {
  fontFamily: "'Outfit', 'Outfit Fallback'",
  fontSize: {
    small: '12px',
    regular: '14px',
  },
} as const;

export const spacing = {
  small: '5px',
  medium: '10px',
  large: '20px',
} as const;

export const transitions = {
  default: '0.2s',
} as const;

export const borderRadius = {
  small: '5px',
  medium: '10px',
} as const;

export const lightTheme: ThemeType = {
  background: '#F5F5F5',
  card: '#F5F5F5',
  cardAlt: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#9A9A9A',
  textAccent: '#C9184A',
  border: '#E4E3E3',
  error: '#E64343',
  success: '#179646',
  headerBg: 'rgba(228, 227, 227, 0.7)',
  footerBg: 'rgba(228, 227, 227, 0.9)',
  buttonBg: '#C9184A',
  buttonText: '#F5F5F5',
  icon: '#C9184A',
  metricCardBg: '#E4E3E3',
  metricCardValue: '#1A1A1A',
  infoCardBg: '#E4E3E3',
  infoCardValue: '#1A1A1A',
  mainChartBg: '#E4E3E3',
  timeframeFilterBg: '#F5F5F5',
  timeframeFilterText: '#9A9A9A',
  dropdownMenuBg: '#F5F5F5',
  pieChartBg: '#E4E3E3',
  pieChartText: '#1A1A1A',
  positionsTableBg: '#E4E3E3',
  positionsTableHeaderBg: '#F5F5F5',
  positionsTableHeaderText: '#9A9A9A',
  positionsTableCellText: '#1A1A1A',
  positionsTableBorder: '#D9D9D9',
  positionsTableButtonBg: '#F5F5F5',
  positionsTableButtonText: '#1A1A1A',
  faqOverlayBg: 'transparent',
  faqWindowBg: 'rgba(245,245,245,0.5)',
  faqTitleBg: '#C9184A',
  faqTitleText: '#F5F5F5',
  faqQuestion: '#1A1A1A',
  faqAnswer: '#9A9A9A',
  faqWrapperBg: '#E4E3E3',
  zeroValueColor: '#1a1a1a',
};

export const darkTheme: ThemeType = {
  background: '#1A1A1A',
  card: '#202020',
  cardAlt: '#1A1A1A',
  text: '#F5F5F5',
  textSecondary: '#9A9A9A',
  textAccent: '#C9184A',
  border: '#232323',
  error: '#E64343',
  success: '#179646',
  headerBg: 'rgba(32, 32, 32, 0.7)',
  footerBg: '#202020',
  buttonBg: '#C9184A',
  buttonText: '#F5F5F5',
  icon: '#C9184A',
  metricCardBg: '#202020',
  metricCardValue: '#F5F5F5',
  infoCardBg: '#202020',
  infoCardValue: '#F5F5F5',
  mainChartBg: '#202020',
  timeframeFilterBg: '#1A1A1A',
  timeframeFilterText: '#9A9A9A',
  dropdownMenuBg: '#1A1A1A',
  pieChartBg: '#202020',
  pieChartText: '#F5F5F5',
  positionsTableBg: '#202020',
  positionsTableHeaderBg: '#1A1A1A',
  positionsTableHeaderText: '#9A9A9A',
  positionsTableCellText: '#F5F5F5',
  positionsTableBorder: '#2A2A2A',
  positionsTableButtonBg: 'rgba(201,24,74,0.08)',
  positionsTableButtonText: '#F5F5F5',
  faqOverlayBg: 'transparent',
  faqWindowBg: 'rgba(26,26,26,0.5)',
  faqTitleBg: '#C9184A',
  faqTitleText: '#F5F5F5',
  faqQuestion: '#F5F5F5',
  faqAnswer: '#9A9A9A',
  faqWrapperBg: '#1A1A1A',
  zeroValueColor: '#f5f5f5',
}; 