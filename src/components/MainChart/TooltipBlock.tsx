import React, { useRef, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { formatDate, formatTime } from '../../utils/format';

const tooltipNames: Record<string, string> = {
  "Axylon's vault": "Axylon's vault",
  "Bitcoin": "Bitcoin",
  "Ethereum": "Ethereum",
  "Hyperliquid": "Hyperliquid",
  "SP500": "SP500",
  "Gold": "Gold",
};

const tooltipColors: Record<string, string> = {
  "Axylon's vault": "#C9184A",
  "Bitcoin": "#FF8A00",
  "Ethereum": "#A3A3A3",
  "Hyperliquid": "#00FFA6",
  "SP500": "#0055FF",
  "Gold": "#FFC300",
};

interface TooltipBlockProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  coordinate?: any;
  activeTimeframe: string;
  data: any[]; // Changed from ChartPoint[] to any[]
}

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.cardAlt};
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  padding: 12px 16px;
  color: ${({ theme }) => theme.text};
`;

const TooltipLabel = styled.div`
  color: ${({ theme }) => theme.text};
`;

const TooltipValue = styled.div`
  color: ${({ theme }) => theme.text};
`;

// В функции formatTooltipDate:
const formatTooltipDate = (point: any): string => { // Changed from ChartPoint to any
  if (point.name) {
    if (/^\d{2}:\d{2}$/.test(point.name)) {
      return `${point.date ? formatDate(point.date) : ''}, ${formatTime(point.name)}`;
    }
    if (point.name.includes(',')) {
      const [date, time] = point.name.split(', ');
      return `${formatDate(date)}, ${formatTime(time)}`;
    }
    if (point.name.includes('-') || point.name.includes('.')) {
      return `${formatDate(point.name)}, 12:00 AM`;
    }
    if (point.name.includes(':')) {
      return `${point.date ? formatDate(point.date) : ''}, ${formatTime(point.name)}`;
    }
    return point.name;
  } else if (point.date && point.time) {
    return `${formatDate(point.date)}, ${formatTime(point.time)}`;
  } else if (point.date) {
    return `${formatDate(point.date)}, 12:00 AM`;
  }
  return '';
};

// Функция для сортировки значений в тултипе
const sortTooltipEntries = (entries: any[]): any[] => {
  // Находим запись для Axylon
  const axylonEntry = entries.find(entry => entry.dataKey === "Axylon's vault");
  // Остальные записи
  const otherEntries = entries
    .filter(entry => entry.dataKey !== "Axylon's vault")
    .sort((a, b) => Number(b.value) - Number(a.value));

  // Возвращаем Axylon первым, затем остальные отсортированные по значению
  return axylonEntry ? [axylonEntry, ...otherEntries] : otherEntries;
};

const TooltipBlock: React.FC<TooltipBlockProps> = (props) => {
  const { active, payload, label, coordinate, activeTimeframe, data } = props;
  const theme = useTheme();
  const [visible, setVisible] = useState(active);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setVisible(true);
    } else {
      // Задержка скрытия тултипа
      hideTimeout.current = setTimeout(() => setVisible(false), 100);
    }
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [active]);

  if (!visible || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  const timeLabel = formatTooltipDate(point);
  const sortedEntries = sortTooltipEntries(payload);

  return (
    <div
      style={{
        background: theme.cardAlt,
        borderRadius: 5,
        padding: 5,
        minWidth: 127,
        color: theme.text,
        fontFamily: 'Outfit, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: theme.text,
          fontWeight: 400,
        }}
      >
        {timeLabel}
      </div>
      {sortedEntries.map((entry: any) => (
        <div
          key={entry.dataKey}
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: tooltipColors[entry.dataKey] || entry.color,
            lineHeight: 1.3,
            marginBottom: 0,
          }}
        >
          {tooltipNames[entry.dataKey] || entry.dataKey}: {Number(entry.value).toFixed(2)}%
        </div>
      ))}
    </div>
  );
};

function areEqual(prevProps: TooltipBlockProps, nextProps: TooltipBlockProps) {
  return prevProps.label === nextProps.label &&
    prevProps.payload?.length === nextProps.payload?.length &&
    prevProps.active === nextProps.active;
}

export default React.memo(TooltipBlock, areEqual); 