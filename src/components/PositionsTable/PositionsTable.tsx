import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { borderRadius } from '../../constants/theme';
import RefreshIcon from '../../assets/icons/refresh-button.svg';
import FilterArrowIcon from '../../assets/icons/filter-arrow-icon.svg';
import ArrowTableIcon from '../../assets/icons/arrow-table.svg';
import { getTradeHistory, TradeHistoryItem } from '../../services/tradeHistoryService';
import { getPositions, Position } from '../../services/apiService';
import ErrorBlock from '../common/ErrorBlock';
import LoaderDiv from '../common/LoaderDiv';

const TableContainer = styled.div`
  background: ${({ theme }) => theme.positionsTableBg};
  border-radius: ${borderRadius.medium};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  color: ${({ theme }) => theme.positionsTableCellText};
  /* margin-top: 16px; */
  @media (max-width: 767px) {
    margin-right: 0px;
    padding: 16px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  @media (max-width: 340px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: 340px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const TabButton = styled.button<{$active?: boolean}>`
  background: ${({ $active, theme }) => ($active ? theme.textAccent : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.buttonText : theme.positionsTableHeaderText)};
  border: none;
  border-radius: 5px;
  padding: 5px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    color: ${({ $active }) => (!$active ? '#C9184A' : undefined)};
  }
  height: 28px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  @media (max-width: 340px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

interface RefreshButtonProps {
  loading?: boolean;
}
const RefreshButton = styled.button<RefreshButtonProps>`
  background: ${({ loading, theme }) =>
    loading
      ? (theme.background === '#1A1A1A' ? '#1a1a1a' : '#f5f5f5')
      : '#C9184A'};
  border: none;
  border-radius: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  width: 28px;
  height: 28px;
`;

const SortButton = styled.button`
  background: #C9184A;
  border: none;
  border-radius: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #F5F5F5;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s;
  height: 28px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  text-align: center;
  vertical-align: middle;
  padding: 0 16px;
  color: ${({ theme }) => theme.positionsTableHeaderText};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  background: none;
  height: 44px;
  border-bottom: 1px solid rgba(154,154,154,0.5);
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const LiqPriceTh = styled(Th)`
  min-width: 130px;
  padding-left: 8px;
  padding-right: 8px;
`;

const Td = styled.td`
  text-align: center;
  vertical-align: middle;
  padding: 0 16px;
  color: ${({ theme }) => theme.positionsTableCellText};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  height: 44px;
  border-bottom: 1px solid rgba(154,154,154,0.5);
  background: none;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const LiqPriceTd = styled(Td)`
  min-width: 130px;
  padding-left: 8px;
  padding-right: 8px;
`;

const Direction = styled.span<{type: string}>`
  color: ${({type}) => type === 'Long' ? '#179646' : '#E64343'};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const PnL = styled.span<{value: number}>`
  color: ${({value, theme}) => value > 0 ? '#179646' : value < 0 ? '#E64343' : theme.zeroValueColor};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const FundingValue = styled.span<{value: string | number}>`
  color: ${({value, theme}) => {
    const numValue = typeof value === 'string' ? Number(value.replace(/[$,\s]/g, '')) : value;
    return numValue > 0 ? '#179646' : numValue < 0 ? '#E64343' : theme.zeroValueColor;
  }};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const PositionsCount = styled.div`
  color: ${({ theme }) => theme.positionsTableHeaderText};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 374px) {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
`;

const PageText = styled.span`
  color: ${({ theme }) => theme.positionsTableHeaderText};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
  @media (max-width: 374px) {
    display: block;
    text-align: right;
    width: 100%;
  }
`;

const PageButton = styled.button<{disabled?: boolean}>`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: none;
  background: ${({ disabled }) => (disabled ? '#232323' : '#C9184A')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;
  margin: 0 2px;
  padding: 0;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const PaginationButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  @media (max-width: 340px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const SortDropdownMenu = styled.div<{width?: number}>`
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: ${({ theme }) => theme.dropdownMenuBg};
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: ${({width}) => width ? `${width}px` : '140px'};
  z-index: 20;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const SortDropdownItem = styled.div<{
  $active?: boolean;
  $hovered?: boolean;
  $first?: boolean;
  $last?: boolean;
  $nextActive?: boolean;
  $nextHovered?: boolean;
  $prevActive?: boolean;
  $prevHovered?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 5px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({ $active, $hovered }) => ($active || $hovered ? '#F5F5F5' : '#9A9A9A')};
  background: ${({ $active, $hovered }) => ($active || $hovered ? '#C9184A' : 'transparent')};
  border-radius: ${({$first, $last, $nextActive, $nextHovered, $prevActive, $prevHovered, $active, $hovered}) => {
    const isCurrent = $active || $hovered;
    const noTop = isCurrent && ($prevActive || $prevHovered);
    const noBottom = isCurrent && ($nextActive || $nextHovered);
    const tl = $first ? '5px' : (noTop ? '0' : '5px');
    const tr = $first ? '5px' : (noTop ? '0' : '5px');
    const br = $last ? '5px' : (noBottom ? '0' : '5px');
    const bl = $last ? '5px' : (noBottom ? '0' : '5px');
    return `${tl} ${tr} ${br} ${bl}`;
  }};
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-radius 0.2s;
  position: relative;
  z-index: ${({$active, $hovered}) => ($active || $hovered ? 1 : 0)};
  @media (max-width: 767px) {
    font-size: 12px;
    font-family: 'Outfit', 'Outfit Fallback';
    font-weight: 400;
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
  width: 100%;
`;

const MiniLoader = styled.div`
  border: 2px solid transparent;
  border-top: 2px solid #C9184A;
  border-radius: 50%;
  width: 13px;
  height: 13px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SortWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

type PositionRow = {
  asset: string;
  direction: string;
  quantity: string;
  entry: string;
  trade: string;
  mark: string;
  pnl: number;
  liq: string;
  funding: string;
};

const transformPosition = (position: Position): PositionRow => {
  const direction = position.size > 0 ? 'Long' : 'Short';
  const quantity = Math.abs(position.size).toFixed(4);
  const markPrice = position.entryPx * (1 + position.uPnl / position.positionValue);

  return {
    asset: position.coin,
    direction,
    quantity,
    entry: `$${formatNumber(position.entryPx)}`,
    trade: `$${formatNumber(position.positionValue)}`,
    mark: `$${formatNumber(markPrice)}`,
    pnl: position.uPnl,
    liq: `$${formatNumber(position.liquidationPx)}`,
    funding: position.funding.toFixed(2),
  };
};

const data: PositionRow[] = [
  {
    asset: 'BTC',
    direction: 'Long',
    quantity: '0.0250',
    entry: '$108 023.10',
    trade: '$2 688.65',
    mark: '$108 100.00',
    pnl: 14.09,
    liq: '$90 000.00',
    funding: '-0.69',
  },
  {
    asset: 'ETH',
    direction: 'Short',
    quantity: '1.0000',
    entry: '$2 000.00',
    trade: '$2 000.00',
    mark: '$1 950.00',
    pnl: -50.00,
    liq: '$2 200.00',
    funding: '-1.00',
  },
  {
    asset: 'BNB',
    direction: 'Long',
    quantity: '10.0000',
    entry: '$300.00',
    trade: '$3 000.00',
    mark: '$310.00',
    pnl: 100.00,
    liq: '$250.00',
    funding: '0.50',
  },
  {
    asset: 'SOL',
    direction: 'Short',
    quantity: '5.0000',
    entry: '$100.00',
    trade: '$500.00',
    mark: '$95.00',
    pnl: 25.00,
    liq: '$120.00',
    funding: '-0.20',
  },
  {
    asset: 'ADA',
    direction: 'Long',
    quantity: '100.0000',
    entry: '$1.00',
    trade: '$100.00',
    mark: '$1.10',
    pnl: 10.00,
    liq: '$0.80',
    funding: '0.05',
  },
  {
    asset: 'XRP',
    direction: 'Short',
    quantity: '200.0000',
    entry: '$0.50',
    trade: '$100.00',
    mark: '$0.48',
    pnl: 4.00,
    liq: '$0.60',
    funding: '-0.02',
  },
  {
    asset: 'DOGE',
    direction: 'Long',
    quantity: '1000.0000',
    entry: '$0.10',
    trade: '$100.00',
    mark: '$0.12',
    pnl: 20.00,
    liq: '$0.08',
    funding: '0.01',
  },
  {
    asset: 'MATIC',
    direction: 'Short',
    quantity: '500.0000',
    entry: '$0.80',
    trade: '$400.00',
    mark: '$0.78',
    pnl: 10.00,
    liq: '$0.90',
    funding: '-0.03',
  },
  {
    asset: 'DOT',
    direction: 'Long',
    quantity: '50.0000',
    entry: '$5.00',
    trade: '$250.00',
    mark: '$5.20',
    pnl: 10.00,
    liq: '$4.50',
    funding: '0.02',
  },
  {
    asset: 'LTC',
    direction: 'Short',
    quantity: '2.0000',
    entry: '$100.00',
    trade: '$200.00',
    mark: '$98.00',
    pnl: 4.00,
    liq: '$110.00',
    funding: '-0.01',
  },
  {
    asset: 'AVAX',
    direction: 'Long',
    quantity: '20.0000',
    entry: '$15.00',
    trade: '$300.00',
    mark: '$16.00',
    pnl: 20.00,
    liq: '$13.00',
    funding: '0.03',
  },
  {
    asset: 'UNI',
    direction: 'Short',
    quantity: '30.0000',
    entry: '$6.00',
    trade: '$180.00',
    mark: '$5.80',
    pnl: 6.00,
    liq: '$7.00',
    funding: '-0.01',
  },
  {
    asset: 'LINK',
    direction: 'Long',
    quantity: '40.0000',
    entry: '$7.00',
    trade: '$280.00',
    mark: '$7.20',
    pnl: 8.00,
    liq: '$6.00',
    funding: '0.02',
  },
  {
    asset: 'ATOM',
    direction: 'Short',
    quantity: '25.0000',
    entry: '$10.00',
    trade: '$250.00',
    mark: '$9.80',
    pnl: 5.00,
    liq: '$11.00',
    funding: '-0.01',
  },
  {
    asset: 'FIL',
    direction: 'Long',
    quantity: '60.0000',
    entry: '$4.00',
    trade: '$240.00',
    mark: '$4.10',
    pnl: 6.00,
    liq: '$3.50',
    funding: '0.01',
  },
];

const tradeHistoryData = [
  {
    openTime: {
      date: '29 Jun 2025',
      time: '1:03 AM'
    },
    closeTime: {
      date: '01 Jul 2025',
      time: '6:52 PM'
    },
    asset: 'BTC',
    direction: 'Long',
    quantity: '0.0250',
    entryPrice: '$108 023.10',
    tradeValue: '$2 688.65',
    pnl: -14.09,
    fees: -0.01,
    funding: -0.69,
    netPnl: 0.35
  },
  {
    openTime: {
      date: '28 Jun 2025',
      time: '8:59 AM'
    },
    closeTime: {
      date: '29 Jun 2025',
      time: '10:31 PM'
    },
    asset: 'BTC',
    direction: 'Long',
    quantity: '0.0250',
    entryPrice: '$108 023.10',
    tradeValue: '$2 688.65',
    pnl: -14.09,
    fees: -0.03,
    funding: -0.69,
    netPnl: 0.25
  },
  {
    openTime: '27.06.2025 10:00 AM',
    closeTime: '28.06.2025 09:00 PM',
    asset: 'BTC',
    direction: 'Long',
    quantity: '0.0250',
    entryPrice: '$108 023.10',
    tradeValue: '$5 377.30',
    pnl: -28.18,
    fees: -0.04,
    funding: -1.38,
    netPnl: 0.60
  },
  {
    openTime: '26.06.2025 09:00 AM',
    closeTime: '27.06.2025 08:00 PM',
    asset: 'ETH',
    direction: 'Short',
    quantity: '1.0000',
    entryPrice: '$2 000.00',
    tradeValue: '$2 000.00',
    pnl: -50.00,
    fees: -0.02,
    funding: -1.00,
    netPnl: -51.02
  },
  {
    openTime: '25.06.2025 07:00 AM',
    closeTime: '26.06.2025 07:00 PM',
    asset: 'BNB',
    direction: 'Long',
    quantity: '10.0000',
    entryPrice: '$300.00',
    tradeValue: '$3 000.00',
    pnl: 100.00,
    fees: -0.05,
    funding: 0.50,
    netPnl: 100.45
  },
  {
    openTime: '24.06.2025 06:00 AM',
    closeTime: '25.06.2025 06:00 PM',
    asset: 'SOL',
    direction: 'Short',
    quantity: '5.0000',
    entryPrice: '$100.00',
    tradeValue: '$500.00',
    pnl: 25.00,
    fees: -0.01,
    funding: -0.20,
    netPnl: 24.79
  },
  {
    openTime: '23.06.2025 05:00 AM',
    closeTime: '24.06.2025 05:00 PM',
    asset: 'ADA',
    direction: 'Long',
    quantity: '100.0000',
    entryPrice: '$1.00',
    tradeValue: '$100.00',
    pnl: 10.00,
    fees: -0.01,
    funding: 0.05,
    netPnl: 10.04
  },
  {
    openTime: '22.06.2025 04:00 AM',
    closeTime: '23.06.2025 04:00 PM',
    asset: 'XRP',
    direction: 'Short',
    quantity: '200.0000',
    entryPrice: '$0.50',
    tradeValue: '$100.00',
    pnl: 4.00,
    fees: -0.01,
    funding: -0.02,
    netPnl: 3.97
  },
  {
    openTime: '21.06.2025 03:00 AM',
    closeTime: '22.06.2025 03:00 PM',
    asset: 'DOGE',
    direction: 'Long',
    quantity: '1000.0000',
    entryPrice: '$0.10',
    tradeValue: '$100.00',
    pnl: 20.00,
    fees: -0.01,
    funding: 0.01,
    netPnl: 20.00
  },
  {
    openTime: '20.06.2025 02:00 AM',
    closeTime: '21.06.2025 02:00 PM',
    asset: 'MATIC',
    direction: 'Short',
    quantity: '500.0000',
    entryPrice: '$0.80',
    tradeValue: '$400.00',
    pnl: 10.00,
    fees: -0.01,
    funding: -0.03,
    netPnl: 9.96
  },
  {
    openTime: '19.06.2025 01:00 AM',
    closeTime: '20.06.2025 01:00 PM',
    asset: 'DOT',
    direction: 'Long',
    quantity: '50.0000',
    entryPrice: '$5.00',
    tradeValue: '$250.00',
    pnl: 10.00,
    fees: -0.01,
    funding: 0.02,
    netPnl: 10.01
  },
  {
    openTime: '18.06.2025 12:00 AM',
    closeTime: '19.06.2025 12:00 PM',
    asset: 'LTC',
    direction: 'Short',
    quantity: '2.0000',
    entryPrice: '$100.00',
    tradeValue: '$200.00',
    pnl: 4.00,
    fees: -0.01,
    funding: -0.01,
    netPnl: 3.98
  },
  {
    openTime: '17.06.2025 11:00 AM',
    closeTime: '18.06.2025 11:00 PM',
    asset: 'AVAX',
    direction: 'Long',
    quantity: '20.0000',
    entryPrice: '$15.00',
    tradeValue: '$300.00',
    pnl: 20.00,
    fees: -0.01,
    funding: 0.03,
    netPnl: 20.02
  },
  {
    openTime: '16.06.2025 10:00 AM',
    closeTime: '17.06.2025 10:00 PM',
    asset: 'UNI',
    direction: 'Short',
    quantity: '30.0000',
    entryPrice: '$6.00',
    tradeValue: '$180.00',
    pnl: 6.00,
    fees: -0.01,
    funding: -0.01,
    netPnl: 5.98
  },
  {
    openTime: '15.06.2025 09:00 AM',
    closeTime: '16.06.2025 09:00 PM',
    asset: 'LINK',
    direction: 'Long',
    quantity: '40.0000',
    entryPrice: '$7.00',
    tradeValue: '$280.00',
    pnl: 8.00,
    fees: -0.01,
    funding: 0.02,
    netPnl: 8.01
  },
  {
    openTime: '14.06.2025 08:00 AM',
    closeTime: '15.06.2025 08:00 PM',
    asset: 'ATOM',
    direction: 'Short',
    quantity: '25.0000',
    entryPrice: '$10.00',
    tradeValue: '$250.00',
    pnl: 5.00,
    fees: -0.01,
    funding: -0.01,
    netPnl: 4.98
  },
  {
    openTime: '13.06.2025 07:00 AM',
    closeTime: '14.06.2025 07:00 PM',
    asset: 'FIL',
    direction: 'Long',
    quantity: '60.0000',
    entryPrice: '$4.00',
    tradeValue: '$240.00',
    pnl: 6.00,
    fees: -0.01,
    funding: 0.01,
    netPnl: 6.00
  },
];

const MAX_ROWS = 10;

function formatNumber(num: number | string) {
  const n = typeof num === 'number' ? num : Number((num + '').replace(/[$,\s]/g, ''));
  if (isNaN(n)) return num;
  const [int, dec] = n.toFixed(2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec ? '.' + dec : '');
}

function formatMoney(value: number | string) {
  const n = typeof value === 'number' ? value : Number((value + '').replace(/[$,\s]/g, ''));
  if (isNaN(n)) return value;
  const abs = Math.abs(n);
  const formatted = formatNumber(abs);
  return (n < 0 ? '-' : '') + '$' + formatted;
}

// Обновляем типы для опций сортировки
interface SortOption {
  label: string;
  value: string;
}

// Обновляем опции сортировки для обеих вкладок
const sortOptions: SortOption[] = [
  { label: 'Asset', value: 'asset' },
  { label: 'Value', value: 'trade' },
  { label: 'P&L', value: 'pnl' },
  { label: 'Funding', value: 'funding' }
];

const tradeSortOptions: SortOption[] = [
  { label: 'Time', value: 'time' },
  { label: 'Value', value: 'value' },
  { label: 'P&L', value: 'pnl' },
  { label: 'Fees', value: 'fees' },
  { label: 'Funding', value: 'funding' },
  { label: 'Net P&L', value: 'netPnl' }
];

// Функция для сортировки истории сделок
const sortTradeHistory = (history: TradeHistoryItem[], sortBy: string): TradeHistoryItem[] => {
  return [...history].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        // Преобразуем строки времени в объекты Date для сравнения
        const dateA = new Date(a.closeTime.date + ' ' + a.closeTime.time);
        const dateB = new Date(b.closeTime.date + ' ' + b.closeTime.time);
        return dateB.getTime() - dateA.getTime(); // Сначала новые

      case 'value':
        const valueA = Number(a.tradeValue.replace(/[$,\s]/g, ''));
        const valueB = Number(b.tradeValue.replace(/[$,\s]/g, ''));
        return valueB - valueA; // От большего к меньшему

      case 'pnl':
        return b.pnl - a.pnl; // От большего к меньшему

      case 'fees':
        const feesA = Number(a.fees.replace(/[$,\s]/g, ''));
        const feesB = Number(b.fees.replace(/[$,\s]/g, ''));
        return feesB - feesA; // От большего к меньшему

      case 'funding':
        const fundingA = Number(a.funding.replace(/[$,\s]/g, ''));
        const fundingB = Number(b.funding.replace(/[$,\s]/g, ''));
        return fundingB - fundingA; // От большего к меньшему

      case 'netPnl':
        return b.netPnl - a.netPnl; // От большего к меньшему

      default:
        return 0;
    }
  });
};

// Хук для проверки ширины экрана
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

// Стили для карточек
const Card = styled.div`
  background: ${({ theme }) => theme.positionsTableHeaderBg || theme.cardAlt};
  border-radius: 12px;
  @media (max-width: 1023px) {
    border-radius: 10px;
  }
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
  margin: 0;
  color: ${({ theme }) => theme.positionsTableCellText};
  font-family: 'Outfit', 'Outfit Fallback';
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CardAsset = styled.span`
  font-size: 20px;
  font-weight: 600;
  font-family: 'Outfit', 'Outfit Fallback';
  @media (max-width: 767px) {
    font-size: 16px;
    font-weight: 600;
  }
`;
const CardDirection = styled.span<{type: string}>`
  font-size: 14px;
  font-weight: 500;
  color: ${({type}) => type === 'Long' ? '#179646' : '#E64343'};
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;
const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
`;
const CardLabel = styled.div<{alignRight?: boolean}>`
  font-size: 12px;
  color: #9A9A9A;
  font-weight: 400;
  ${({alignRight}) => alignRight && 'text-align: right;'}
  @media (max-width: 767px) {
    font-size: 10px;
    font-weight: 400;
  }
`;
const CardValue = styled.div<{color?: string, bold?: boolean, alignRight?: boolean}>`
  font-size: 14px;
  font-weight: ${({bold}) => bold ? 500 : 400};
  color: ${({color, theme}) => color ? color : theme.positionsTableCellText};
  ${({alignRight}) => alignRight && 'text-align: right;'}
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

// Карточка для позиции
const PositionCard: React.FC<{ row: PositionRow }> = ({ row }) => (
  <Card>
    <CardHeader>
      <CardAsset>{row.asset}</CardAsset>
      <CardDirection type={row.direction}>{row.direction}</CardDirection>
    </CardHeader>
    <CardGrid>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel>Quantity</CardLabel>
        <CardValue>{formatNumber(row.quantity)}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel alignRight>Entry Price</CardLabel>
        <CardValue alignRight>{row.entry}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel>Trade Value</CardLabel>
        <CardValue>{formatMoney(row.trade)}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel alignRight>Mark Price</CardLabel>
        <CardValue alignRight>{row.mark}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel>P&L</CardLabel>
        <CardValue color={row.pnl > 0 ? '#179646' : row.pnl < 0 ? '#E64343' : '#9A9A9A'} bold>{formatMoney(row.pnl)}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel alignRight>Liq. Price</CardLabel>
        <CardValue alignRight>{row.liq}</CardValue>
      </div>
      <div style={{ flex: '1 1 50%' }}>
        <CardLabel>Funding</CardLabel>
        <CardValue color={Number(row.funding) > 0 ? '#179646' : Number(row.funding) < 0 ? '#E64343' : '#9A9A9A'}>{formatMoney(row.funding)}</CardValue>
      </div>
    </CardGrid>
  </Card>
);

// Добавляем новые компоненты для форматирования
const FeesValue = styled.span<{ value: number }>`
  color: ${({ value, theme }) => {
    if (value === 0) return theme.positionsTableCellText;
    return value > 0 ? '#179646' : '#E64343';
  }};
`;

// Функция для форматирования значений с разделением тысяч пробелами
function formatTradeValue(value: string | number): string {
  const numValue = typeof value === 'string' ? Number(value.replace(/[$,\s]/g, '')) : value;
  if (isNaN(numValue)) return String(value);
  const [int, dec] = Math.abs(numValue).toFixed(2).split('.');
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (numValue < 0 ? '-$' : '$') + formattedInt + (dec ? '.' + dec : '');
}

// Функция для форматирования fees с инверсией знака
function formatFees(value: string | number): { displayValue: string; actualValue: number } {
  const numValue = typeof value === 'string' ? Number(value.replace(/[$,\s]/g, '')) : value;
  if (isNaN(numValue) || numValue === 0) return { displayValue: '$0.00', actualValue: 0 };
  // Инвертируем знак для отображения
  const displayNumValue = -numValue;
  const [int, dec] = Math.abs(displayNumValue).toFixed(2).split('.');
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return {
    displayValue: (displayNumValue < 0 ? '-$' : '$') + formattedInt + (dec ? '.' + dec : ''),
    actualValue: displayNumValue
  };
}

// Карточка для истории сделок
const TradeHistoryCard: React.FC<{ row: TradeHistoryItem }> = ({ row }) => {
  const { displayValue: feesDisplay, actualValue: feesValue } = formatFees(row.fees);
  const fundingValue = Number(row.funding.replace(/[$,\s]/g, ''));
  
  return (
    <Card>
      <CardHeader>
        <CardAsset>{row.asset}</CardAsset>
        <CardDirection type={row.direction}>{row.direction}</CardDirection>
      </CardHeader>
      <CardGrid>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel>Open Time</CardLabel>
          <CardValue>
            {row.openTime.date}<br />
            {row.openTime.time}
          </CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel alignRight>Net P&L</CardLabel>
          <CardValue alignRight color={row.netPnl === 0 ? '#9A9A9A' : row.netPnl > 0 ? '#179646' : '#E64343'} bold>
            {formatMoney(row.netPnl)}
          </CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel>Close Time</CardLabel>
          <CardValue>
            {row.closeTime.date}<br />
            {row.closeTime.time}
          </CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel alignRight>Quantity</CardLabel>
          <CardValue alignRight>{row.quantity}</CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel>Entry Price</CardLabel>
          <CardValue>{row.entry}</CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel alignRight>Trade Value</CardLabel>
          <CardValue alignRight>{formatTradeValue(row.tradeValue)}</CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel>P&L</CardLabel>
          <CardValue color={row.pnl > 0 ? '#179646' : row.pnl < 0 ? '#E64343' : '#9A9A9A'} bold>
            {formatMoney(row.pnl)}
          </CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel alignRight>Fees</CardLabel>
          <CardValue alignRight color={feesValue !== 0 ? (feesValue > 0 ? '#179646' : '#E64343') : undefined}>
            {feesDisplay}
          </CardValue>
        </div>
        <div style={{ flex: '1 1 50%' }}>
          <CardLabel>Funding</CardLabel>
          <CardValue color={fundingValue !== 0 ? (fundingValue > 0 ? '#179646' : '#E64343') : undefined}>
            {formatMoney(fundingValue)}
          </CardValue>
        </div>
      </CardGrid>
    </Card>
  );
};

// Итоговая карточка для мобильных/планшетов
const TotalCard = styled(Card)`
  grid-column: 1 / -1;
  margin-top: 0;
`;

const TotalCardGrid = styled.div<{columns: number}>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({columns}) => `repeat(${columns}, 1fr)`};
  gap: 0;
  & > div {
    min-width: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  & > div:first-child {
    text-align: left;
    align-items: flex-start;
  }
  & > div:last-child {
    text-align: right;
    align-items: flex-end;
  }
  & > div:not(:first-child):not(:last-child) {
    text-align: center;
    align-items: center;
  }
  @media (max-width: 425px) {
    ${({columns}) =>
      columns === 3
        ? `
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, auto);
          row-gap: 8px;
          & > div:nth-child(1) { grid-row: 1; grid-column: 1; justify-self: start; }
          & > div:nth-child(2) { grid-row: 1; grid-column: 2; justify-self: end; }
          & > div:nth-child(3) { grid-row: 2; grid-column: 1; justify-self: start; }
        `
        : columns === 5
        ? `
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, auto);
          row-gap: 8px;
          & > div:nth-child(1) { grid-row: 1; grid-column: 1; justify-self: start; }
          & > div:nth-child(2) { grid-row: 1; grid-column: 2; justify-self: center; }
          & > div:nth-child(3) { grid-row: 1; grid-column: 3; justify-self: end; }
          & > div:nth-child(4) { grid-row: 2; grid-column: 1; justify-self: start; }
          & > div:nth-child(5) { grid-row: 2; grid-column: 2; justify-self: center; }
        `
        : ''}
    & > div {
      align-items: flex-start !important;
      text-align: left !important;
    }
  }
`;

const PositionsTotalCard: React.FC<{ positions: PositionRow[] }> = ({ positions }) => {
  const totalTradeValue = positions.reduce((sum, row) => sum + Number((row.trade + '').replace(/[$,\s]/g, '')), 0);
  const totalPnL = positions.reduce((sum, row) => sum + (typeof row.pnl === 'number' ? row.pnl : Number((row.pnl + '').replace(/[$,\s]/g, ''))), 0);
  const totalFunding = positions.reduce((sum, row) => sum + Number((row.funding + '').replace(/[$,\s]/g, '')), 0);
  
  return (
    <TotalCard>
      <TotalCardGrid columns={3}>
        <div>
          <CardLabel>Trade Value</CardLabel>
          <CardValue bold>{formatMoney(totalTradeValue)}</CardValue>
        </div>
        <div>
          <CardLabel>P&L</CardLabel>
          <CardValue color={totalPnL > 0 ? '#179646' : totalPnL < 0 ? '#E64343' : '#9A9A9A'} bold>{formatMoney(totalPnL)}</CardValue>
        </div>
        <div>
          <CardLabel>Funding</CardLabel>
          <CardValue color={totalFunding > 0 ? '#179646' : totalFunding < 0 ? '#E64343' : '#9A9A9A'} bold>{formatMoney(totalFunding)}</CardValue>
        </div>
      </TotalCardGrid>
    </TotalCard>
  );
};

const TradeHistoryTotalCard: React.FC<{ tradeHistory: TradeHistoryItem[] }> = ({ tradeHistory }) => {
  const totalTradeValue = tradeHistory.reduce((sum, r) => sum + Number(r.tradeValue.replace(/[$,\s]/g, '')), 0);
  const totalPnL = tradeHistory.reduce((sum, r) => sum + r.pnl, 0);
  // Инвертируем знак для общей суммы fees
  const totalFees = -tradeHistory.reduce((sum, r) => sum + Number(r.fees.replace(/[$,\s]/g, '')), 0);
  const totalFunding = tradeHistory.reduce((sum, r) => sum + Number(r.funding.replace(/[$,\s]/g, '')), 0);
  const totalNetPnl = tradeHistory.reduce((sum, r) => sum + r.netPnl, 0);
  
  return (
    <TotalCard>
      <TotalCardGrid columns={5}>
        <div>
          <CardLabel>Trade Value</CardLabel>
          <CardValue bold>{formatTradeValue(totalTradeValue)}</CardValue>
        </div>
        <div>
          <CardLabel>P&L</CardLabel>
          <CardValue color={totalPnL > 0 ? '#179646' : totalPnL < 0 ? '#E64343' : '#9A9A9A'} bold>
            {formatMoney(totalPnL)}
          </CardValue>
        </div>
        <div>
          <CardLabel>Fees</CardLabel>
          <CardValue color={totalFees !== 0 ? (totalFees > 0 ? '#179646' : '#E64343') : '#9A9A9A'} bold>
            {formatMoney(totalFees)}
          </CardValue>
        </div>
        <div>
          <CardLabel>Funding</CardLabel>
          <CardValue color={totalFunding !== 0 ? (totalFunding > 0 ? '#179646' : totalFunding < 0 ? '#E64343' : '#9A9A9A') : '#9A9A9A'} bold>
            {formatMoney(totalFunding)}
          </CardValue>
        </div>
        <div>
          <CardLabel>Net P&L</CardLabel>
          <CardValue color={totalNetPnl > 0 ? '#179646' : totalNetPnl < 0 ? '#E64343' : '#9A9A9A'} bold>
            {formatMoney(totalNetPnl)}
          </CardValue>
        </div>
      </TotalCardGrid>
    </TotalCard>
  );
};

const PositionsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [page, setPage] = useState(1);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortSelected, setSortSelected] = useState<string>('Time');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortHovered, setSortHovered] = useState<number | null>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [sortButtonWidth, setSortButtonWidth] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (sortDropdownOpen && sortButtonRef.current) {
      setSortButtonWidth(sortButtonRef.current.offsetWidth);
    }
  }, [sortDropdownOpen]);

  // Load positions data
  const loadPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const positionsData = await getPositions();
      setPositions(positionsData.map(transformPosition));
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load trade history data
  const loadTradeHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const historyData = await getTradeHistory();
      setTradeHistory(historyData);
    } catch (error) {
      console.error('Error loading trade history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount and tab change
  useEffect(() => {
    if (activeTab === 'history') {
      loadTradeHistory();
    } else {
      loadPositions();
    }
  }, [activeTab, loadTradeHistory, loadPositions]);

  // Получаем отсортированные данные
  const getSortedData = useCallback(() => {
    if (activeTab === 'history') {
      const sortBy = tradeSortOptions.find(opt => opt.label === sortSelected)?.value || 'time';
      return sortTradeHistory(tradeHistory, sortBy);
    } else {
      // Существующая логика сортировки для positions
      return positions;
    }
  }, [activeTab, tradeHistory, positions, sortSelected]);

  // Обновляем расчет видимых строк с учетом сортировки
  const sortedData = useMemo(() => getSortedData(), [activeTab, tradeHistory, positions, sortSelected]);
  const startIdx = (page - 1) * MAX_ROWS;
  const endIdx = startIdx + MAX_ROWS;

  // Разделяем видимые строки по типам
  const visiblePositionRows = useMemo(() => activeTab === 'positions' ? (sortedData as PositionRow[]).slice(startIdx, endIdx) : [], [activeTab, sortedData, startIdx, endIdx]);
  const visibleTradeRows = useMemo(() => activeTab === 'history' ? (sortedData as TradeHistoryItem[]).slice(startIdx, endIdx) : [], [activeTab, sortedData, startIdx, endIdx]);

  // Обновляем расчет для карточек
  const cardStartIdx = (page - 1) * MAX_ROWS;
  const cardEndIdx = cardStartIdx + MAX_ROWS;
  const visiblePositionCards = useMemo(() => positions.slice(cardStartIdx, cardEndIdx), [positions, cardStartIdx, cardEndIdx]);
  const visibleTradeCards = useMemo(() => (activeTab === 'history' ? sortedData as TradeHistoryItem[] : []).slice(cardStartIdx, cardEndIdx), [activeTab, sortedData, cardStartIdx, cardEndIdx]);

  // Расчет итоговых значений для positions
  const positionTotals = {
    tradeValue: positions.reduce((sum, row) => sum + Number((row.trade + '').replace(/[$,\s]/g, '')), 0),
    pnl: positions.reduce((sum, row) => sum + (typeof row.pnl === 'number' ? row.pnl : Number((row.pnl + '').replace(/[$,\s]/g, ''))), 0),
    funding: positions.reduce((sum, row) => sum + Number((row.funding + '').replace(/[$,\s]/g, '')), 0)
  };

  // Расчет страниц
  const totalPages = Math.ceil((activeTab === 'positions' ? positions : sortedData).length / MAX_ROWS);
  const totalPositionPages = Math.ceil(positions.length / MAX_ROWS);
  const totalTradePages = Math.ceil(sortedData.length / MAX_ROWS);

  // Получаем текущие опции сортировки
  const currentSortOptions = activeTab === 'history' ? tradeSortOptions : sortOptions;

  const handleRefresh = useCallback(() => {
    setLoading(true);
    if (activeTab === 'history') {
      loadTradeHistory().finally(() => setLoading(false));
    } else {
      loadPositions().finally(() => setLoading(false));
    }
  }, [activeTab, loadTradeHistory, loadPositions]);

  const isMobile = useMediaQuery('(max-width: 599px)');
  const isTablet = useMediaQuery('(min-width: 600px) and (max-width: 1023px)');
  const cardsPerPage = isMobile ? 5 : isTablet ? 10 : MAX_ROWS;
  const columns = isMobile ? 1 : isTablet ? 2 : 1;

  return (
    <TableContainer>
      <TopBar>
        <Tabs>
          <TabButton
            $active={activeTab === 'positions'}
            onClick={() => {
              setActiveTab('positions');
              setPage(1);
              setSortSelected('Asset');
            }}
          >
            Positions
          </TabButton>
          <TabButton
            $active={activeTab === 'history'}
            onClick={() => {
              setActiveTab('history');
              setPage(1);
              setSortSelected('Time');
            }}
          >
            Trade History
          </TabButton>
        </Tabs>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <RefreshButton onClick={handleRefresh} disabled={loading}>
            <img
              src={RefreshIcon}
              alt="Refresh"
              style={{
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }}
            />
          </RefreshButton>
          <SortWrapper>
            <SortButton
              ref={sortButtonRef}
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            >
              <span>Sort by</span>
              <img
                src={FilterArrowIcon}
                alt="Sort"
                style={{
                  transform: sortDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }}
              />
            </SortButton>
            {sortDropdownOpen && (
              <SortDropdownMenu width={sortButtonWidth}>
                {currentSortOptions.map((option, index) => (
                  <SortDropdownItem
                    key={option.value}
                    $active={sortSelected === option.label}
                    $hovered={sortHovered === index}
                    $first={index === 0}
                    $last={index === currentSortOptions.length - 1}
                    $nextActive={index < currentSortOptions.length - 1 && sortSelected === currentSortOptions[index + 1].label}
                    $nextHovered={index < currentSortOptions.length - 1 && sortHovered === index + 1}
                    $prevActive={index > 0 && sortSelected === currentSortOptions[index - 1].label}
                    $prevHovered={index > 0 && sortHovered === index - 1}
                    onMouseEnter={() => setSortHovered(index)}
                    onMouseLeave={() => setSortHovered(null)}
                    onClick={() => {
                      setSortSelected(option.label);
                      setSortDropdownOpen(false);
                      setPage(1); // Сброс страницы при изменении сортировки
                    }}
                  >
                    {option.label}
                  </SortDropdownItem>
                ))}
              </SortDropdownMenu>
            )}
          </SortWrapper>
        </div>
      </TopBar>

      {isMobile || isTablet ? (
        activeTab === 'positions' ? (
          loading ? (
            <LoaderDiv><div /></LoaderDiv>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '16px',
                marginBottom: '16px',
              }}>
                {visiblePositionCards.map((row, idx) => (
                  <PositionCard row={row} key={idx} />
                ))}
                <PositionsTotalCard positions={positions} />
              </div>
              {positions.length > MAX_ROWS && (
                <BottomBar>
                  <PositionsCount>{`Showing ${cardStartIdx + 1} to ${Math.min(cardEndIdx, positions.length)} of ${positions.length} positions`}</PositionsCount>
                  <Pagination>
                    <PageText>Page {page} of {totalPositionPages}</PageText>
                    <PaginationButtons>
                      <PageButton onClick={() => setPage(page === 1 ? totalPositionPages : page - 1)}>
                        <img src={ArrowTableIcon} alt="Prev" width={10} height={10} />
                      </PageButton>
                      <PageButton onClick={() => setPage(page === totalPositionPages ? 1 : page + 1)}>
                        <img src={ArrowTableIcon} alt="Next" style={{ transform: 'rotate(180deg)' }} width={10} height={10} />
                      </PageButton>
                    </PaginationButtons>
                  </Pagination>
                </BottomBar>
              )}
            </>
          )
        ) : (
          loading ? (
            <LoaderDiv><div /></LoaderDiv>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '16px',
                marginBottom: '16px',
              }}>
                {visibleTradeCards.map((row, idx) => (
                  <TradeHistoryCard row={row} key={idx} />
                ))}
                <TradeHistoryTotalCard tradeHistory={tradeHistory} />
              </div>
              {tradeHistory.length > MAX_ROWS && (
                <BottomBar>
                  <PositionsCount>
                    {`Showing ${startIdx + 1} to ${Math.min(endIdx, sortedData.length)} of ${sortedData.length} trades`}
                  </PositionsCount>
                  <Pagination>
                    <PageText>Page {page} of {totalTradePages}</PageText>
                    <PaginationButtons>
                      <PageButton onClick={() => setPage(page === 1 ? totalTradePages : page - 1)}>
                        <img src={ArrowTableIcon} alt="Prev" width={10} height={10} />
                      </PageButton>
                      <PageButton onClick={() => setPage(page === totalTradePages ? 1 : page + 1)}>
                        <img src={ArrowTableIcon} alt="Next" style={{ transform: 'rotate(180deg)' }} width={10} height={10} />
                      </PageButton>
                    </PaginationButtons>
                  </Pagination>
                </BottomBar>
              )}
            </>
          )
        )
      ) : (
        activeTab === 'positions' ? (
          loading ? (
            <LoaderDiv><div /></LoaderDiv>
          ) : positions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', width: '100%' }}>
              <span style={{ fontFamily: "'Outfit', 'Outfit Fallback'", fontSize: 14, fontWeight: 400, color: '#9A9A9A' }}>No open positions yet</span>
            </div>
          ) : (
            <>
              <Table>
                <colgroup>
                  <col style={{ width: '112px' }} />
                  <col style={{ width: '118px' }} />
                  <col style={{ width: '126px' }} />
                  <col style={{ width: '124px' }} />
                  <col style={{ width: '132px' }} />
                  <col style={{ width: '128px' }} />
                  <col style={{ width: '96px' }} />
                  <col style={{ width: '104px' }} />
                  <col style={{ width: '105px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <Th>Asset</Th>
                    <Th>Direction</Th>
                    <Th>Quantity</Th>
                    <Th>Entry Price</Th>
                    <Th>Trade Value</Th>
                    <Th>Mark Price</Th>
                    <Th>P&L</Th>
                    <LiqPriceTh>Liq. Price</LiqPriceTh>
                    <Th>Funding</Th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePositionRows.map((row, idx) => (
                    <tr key={idx}>
                      <Td>{row.asset}</Td>
                      <Td><Direction type={row.direction}>{row.direction}</Direction></Td>
                      <Td>{formatNumber(row.quantity)}</Td>
                      <Td>{row.entry}</Td>
                      <Td>{formatMoney(row.trade)}</Td>
                      <Td>{row.mark}</Td>
                      <Td><PnL value={row.pnl}>{formatMoney(row.pnl)}</PnL></Td>
                      <LiqPriceTd>{row.liq}</LiqPriceTd>
                      <Td><FundingValue value={Number(row.funding)}>{formatMoney(row.funding)}</FundingValue></Td>
                    </tr>
                  ))}
                  <tr>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}>{formatMoney(positionTotals.tradeValue)}</Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}><PnL value={positionTotals.pnl}>{formatMoney(positionTotals.pnl)}</PnL></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}><FundingValue value={positionTotals.funding}>{formatMoney(positionTotals.funding)}</FundingValue></Td>
                  </tr>
                </tbody>
              </Table>
              {positions.length > MAX_ROWS && (
                <BottomBar>
                  <PositionsCount>{`Showing ${startIdx + 1} to ${Math.min(endIdx, positions.length)} of ${positions.length} positions`}</PositionsCount>
                  <Pagination>
                    <PageText>Page {page} of {totalPages}</PageText>
                    <PaginationButtons>
                      <PageButton onClick={() => setPage(page === 1 ? totalPages : page - 1)}>
                        <img src={ArrowTableIcon} alt="Prev" width={10} height={10} />
                      </PageButton>
                      <PageButton onClick={() => setPage(page === totalPages ? 1 : page + 1)}>
                        <img src={ArrowTableIcon} alt="Next" style={{ transform: 'rotate(180deg)' }} width={10} height={10} />
                      </PageButton>
                    </PaginationButtons>
                  </Pagination>
                </BottomBar>
              )}
            </>
          )
        ) : (
          loading ? (
            <LoaderDiv><div /></LoaderDiv>
          ) : (
            <>
              <Table>
                <colgroup>
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '90px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <Th>Open Time</Th>
                    <Th>Close Time</Th>
                    <Th>Asset</Th>
                    <Th>Direction</Th>
                    <Th>Quantity</Th>
                    <Th>Entry Price</Th>
                    <Th>Trade Value</Th>
                    <Th>P&L</Th>
                    <Th>Fees</Th>
                    <Th>Funding</Th>
                    <Th>Net P&L</Th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTradeRows.map((row, idx) => {
                    const { displayValue: feesDisplay, actualValue: feesValue } = formatFees(row.fees);
                    const fundingValue = Number(row.funding.replace(/[$,\s]/g, ''));
                    
                    return (
                      <tr key={idx}>
                        <Td>
                          {row.openTime.date}<br />
                          {row.openTime.time}
                        </Td>
                        <Td>
                          {row.closeTime.date}<br />
                          {row.closeTime.time}
                        </Td>
                        <Td>{row.asset}</Td>
                        <Td><Direction type={row.direction}>{row.direction}</Direction></Td>
                        <Td>{formatNumber(row.quantity)}</Td>
                        <Td>{row.entry}</Td>
                        <Td>{formatTradeValue(row.tradeValue)}</Td>
                        <Td><PnL value={row.pnl}>{formatMoney(row.pnl)}</PnL></Td>
                        <Td>
                          <FeesValue value={feesValue}>{feesDisplay}</FeesValue>
                        </Td>
                        <Td>
                          <FundingValue value={fundingValue}>{formatMoney(fundingValue)}</FundingValue>
                        </Td>
                        <Td><PnL value={row.netPnl} color={row.netPnl === 0 ? '#9A9A9A' : row.netPnl > 0 ? '#179646' : '#E64343'}>{formatMoney(row.netPnl)}</PnL></Td>
                      </tr>
                    );
                  })}
                  <tr>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}></Td>
                    <Td style={{ borderBottom: 'none' }}>{formatTradeValue(tradeHistory.reduce((sum, r) => sum + Number((r.tradeValue + '').replace(/[$,\s]/g, '')), 0))}</Td>
                    <Td style={{ borderBottom: 'none' }}><PnL value={tradeHistory.reduce((sum, r) => sum + (typeof r.pnl === 'number' ? r.pnl : Number((r.pnl + '').replace(/[$,\s]/g, ''))), 0)}>{formatMoney(tradeHistory.reduce((sum, r) => sum + (typeof r.pnl === 'number' ? r.pnl : Number((r.pnl + '').replace(/[$,\s]/g, ''))), 0))}</PnL></Td>
                    <Td style={{ borderBottom: 'none' }}>
                      {(() => {
                        const totalFees = -tradeHistory.reduce((sum, r) => sum + (typeof r.fees === 'number' ? r.fees : Number((r.fees + '').replace(/[$,\s]/g, ''))), 0);
                        return <FeesValue value={totalFees}>{formatMoney(totalFees)}</FeesValue>;
                      })()}
                    </Td>
                    <Td style={{ borderBottom: 'none' }}><FundingValue value={tradeHistory.reduce((sum, r) => sum + (typeof r.funding === 'number' ? r.funding : Number((r.funding + '').replace(/[$,\s]/g, ''))), 0)}>{formatMoney(tradeHistory.reduce((sum, r) => sum + (typeof r.funding === 'number' ? r.funding : Number((r.funding + '').replace(/[$,\s]/g, ''))), 0))}</FundingValue></Td>
                    <Td style={{ borderBottom: 'none' }}><PnL value={tradeHistory.reduce((sum, r) => sum + (typeof r.netPnl === 'number' ? r.netPnl : Number((r.netPnl + '').replace(/[$,\s]/g, ''))), 0)}>{formatMoney(tradeHistory.reduce((sum, r) => sum + (typeof r.netPnl === 'number' ? r.netPnl : Number((r.netPnl + '').replace(/[$,\s]/g, ''))), 0))}</PnL></Td>
                  </tr>
                </tbody>
              </Table>
              {tradeHistory.length > MAX_ROWS && (
                <BottomBar>
                  <PositionsCount>{`Showing ${startIdx + 1} to ${Math.min(endIdx, tradeHistory.length)} of ${tradeHistory.length} trades`}</PositionsCount>
                  <Pagination>
                    <PageText>Page {page} of {totalTradePages}</PageText>
                    <PaginationButtons>
                      <PageButton onClick={() => setPage(page === 1 ? totalTradePages : page - 1)}>
                        <img src={ArrowTableIcon} alt="Prev" width={10} height={10} />
                      </PageButton>
                      <PageButton onClick={() => setPage(page === totalTradePages ? 1 : page + 1)}>
                        <img src={ArrowTableIcon} alt="Next" style={{ transform: 'rotate(180deg)' }} width={10} height={10} />
                      </PageButton>
                    </PaginationButtons>
                  </Pagination>
                </BottomBar>
              )}
            </>
          )
        )
      )}
    </TableContainer>
  );
};

export default PositionsTable; 