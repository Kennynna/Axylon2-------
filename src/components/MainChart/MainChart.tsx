import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getChartData } from '../../services/apiService';
import TooltipBlock from './TooltipBlock';
import TimeframeFilter from './TimeframeFilter';
import CompareWithDropdown from './CompareWithDropdown';
import { getXAxisLabels, getTicks } from '../../utils/chartUtils';
import { formatDate, formatTime } from '../../utils/format';
import { ReactComponent as PlusIcon } from '../../assets/icons/Plus Icon.svg';
import { compareOptions, timeframes as timeframeOptions, Timeframe } from './MainChart.types';
import { colors } from '../../constants/theme';
import {
  ChartBlock,
  FiltersRow,
  CompareButton,
  CompareButtonContent,
} from './MainChart.styles';
import styled, { keyframes } from 'styled-components';
import Loader from '../common/Loader';
import ErrorBlock from '../common/ErrorBlock';
import LoaderDiv from '../common/LoaderDiv';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.text.secondary};
  border-top: 2px solid ${colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const AnimatedPlus = styled(PlusIcon)<{open: boolean}>`
  transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
  transform: rotate(${({ open }) => (open ? 45 : 0)}deg);
`;

const isHideYAxisLabels = () => typeof window !== 'undefined' && window.innerWidth <= 426;

interface MainChartProps {
  tf: number;
  setTf: (index: number) => void;
  data: any[];
  loading: boolean;
  error: string | null;
}

const MainChart: React.FC<MainChartProps> = ({ tf, setTf, data, loading, error }) => {
  // State management
  const [hover, setHover] = useState<number | null>(null);
  const [dropdown, setDropdown] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>(['Bitcoin', 'Ethereum']);
  const [dropdownWidth, setDropdownWidth] = useState<number>();
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1920);
  // убираем локальное состояние tf/data/loading/error
  
  // Refs
  const ref = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derived values with improved memoization
  const activeTf = useMemo(() => timeframeOptions[tf] as Timeframe, [tf]);
  
  // Добавляем индекс к каждой точке данных
  const dataWithIndex = useMemo(() => data.map((d, i) => {
    let formattedPoint = { ...d, idx: i };
    // Форматируем дату и время для каждой точки
    if (activeTf === '1d' && /^\d{2}:\d{2}$/.test(d.name)) {
      const timestamp = d.ts || d.timestamp;
      const date = timestamp ? new Date(timestamp) : new Date();
      formattedPoint.displayDate = `${formatDate(date)}`;
      formattedPoint.displayTime = `${formatTime(d.name)}`;
    } else {
      formattedPoint.displayDate = d.date ? formatDate(d.date) : '';
      formattedPoint.displayTime = d.name && d.name.includes(':') ? formatTime(d.name) : '';
    }
    return formattedPoint;
  }), [data, activeTf]);

  // Функция для загрузки данных
  const loadData = useCallback(async (timeframe: string) => {
    // setLoading(true); // This state is now managed by the parent
    // setError(null); // This state is now managed by the parent
    
    try {
      const chartData = await getChartData(timeframe);
      if (!chartData || chartData.length === 0) {
        throw new Error('No data available for the selected timeframe');
      }
      // setData(chartData); // This state is now managed by the parent
    } catch (err) {
      console.error('Error loading chart data:', err);
      // setError('Error loading data. Please try again later.'); // This state is now managed by the parent
      // setData([]); // This state is now managed by the parent
    } finally {
      // setLoading(false); // This state is now managed by the parent
    }
  }, []);

  // Загрузка данных при изменении таймфрейма
  useEffect(() => {
    loadData(activeTf);
  }, [activeTf, loadData]);

  // Формируем индексы для xLabels (5 подписей под 7 линиями)
  const xLabelIndexes = useMemo(() => {
    if (data.length === 0) return [];
    if (data.length <= 2) return [];
    const labels = 5;
    const step = (data.length - 1) / (labels + 1);
    return Array.from({ length: labels }, (_, i) => Math.round((i + 1) * step));
  }, [data]);

  // Подписи для этих индексов (реальные значения из данных)
  const xLabels = useMemo(() => {
    if (activeTf === '1d') {
      return xLabelIndexes.map(i => {
        const t = data[i]?.name;
        if (!t) return '';
        if (/^\d{2}:\d{2}$/.test(t)) {
          return formatTime(t);
        }
        return t;
      });
    }
    return xLabelIndexes.map(i => {
      const d = data[i]?.date || data[i]?.name;
      if (!d) return '';
      return formatDate(d);
    });
  }, [data, xLabelIndexes, activeTf]);

  // Определяем ключ для оси X
  const xDataKey = useMemo(() => (['7d', '30d', 'All'].includes(activeTf) ? 'date' : 'name'), [activeTf]);
  // Получаем уникальные значения по этому ключу
  const xReferenceValues = useMemo(
    () => Array.from(new Set(data.map(d => d[xDataKey]))).filter(v => v !== undefined && v !== null && v !== ''),
    [data, xDataKey]
  );

  // ReferenceLine по индексам точек, соответствующих основным подписям
  const xLabelReferenceIndexes = useMemo(() => {
    return xLabels.map(label => data.findIndex(d => d[xDataKey] === label)).filter(idx => idx !== -1);
  }, [data, xLabels, xDataKey]);

  // ReferenceLine: для 1d по значению, для остальных по индексу
  const xLabelReferenceLines = useMemo(() => {
    if (activeTf === '1d') {
      return xLabels.map((label, idx) => ({ key: label + idx, x: label }));
    } else {
      return xLabels
        .map(label => {
          const index = data.findIndex(d => d[xDataKey] === label);
          return index !== -1 ? { key: String(index), x: index } : null;
        })
        .filter((v): v is { key: string; x: number } => v !== null);
    }
  }, [activeTf, xLabels, data, xDataKey]);

  // Мемоизированные компоненты графика
  const CartesianGridMemo = useMemo(() => (
    <CartesianGrid 
      horizontal 
      vertical={false} 
      strokeDasharray="2 4" 
      stroke={colors.text.tertiary} 
      strokeWidth={0.5} 
    />
  ), []);

  const XAxisMemo = useMemo(() => (
    <XAxis
      dataKey="idx"
      type="number"
      domain={[0, data.length - 1]}
      stroke={colors.text.tertiary}
      fontSize={window.innerWidth <= 767 ? 10 : 12}
      fontFamily="Outfit"
      tickLine={false}
      axisLine={false}
      height={32}
      tick={{ dy: 8 }}
      ticks={xLabelIndexes}
      tickFormatter={(_, i) => xLabels[i] || ''}
    />
  ), [data.length, xLabelIndexes, xLabels]);

  const isMobileYAxis = windowWidth <= 426;

  const YAxisMemo = useMemo(() => {
    return (
      <YAxis
        stroke={colors.text.tertiary}
        fontSize={windowWidth <= 767 ? 10 : 12}
        fontFamily="Outfit"
        tickLine={false}
        axisLine={false}
        width={isMobileYAxis ? 0 : 40}
        tick={{ dx: 4 }}
        orientation="right"
        domain={['auto', 'auto']}
        tickFormatter={v => isMobileYAxis ? '' : v.toFixed(1) + '%'}
      />
    );
  }, [windowWidth, isMobileYAxis]);

  const TooltipMemo = useMemo(() => (
    <Tooltip 
      content={<TooltipBlock activeTimeframe={activeTf} data={data} />} 
      cursor={false}
    />
  ), [activeTf, data]);

  const ReferenceLinesEdge = useMemo(() => (
    <>
      <ReferenceLine
        x={0}
        stroke={colors.text.tertiary}
        strokeDasharray="2 4"
        strokeWidth={0.5}
      />
      <ReferenceLine
        x={data.length - 1}
        stroke={colors.text.tertiary}
        strokeDasharray="2 4"
        strokeWidth={0.5}
      />
    </>
  ), [data.length]);

  // Оптимизированные обработчики
  const handleTimeframeClick = useCallback((index: number) => setTf(index), [setTf]);
  const handleTimeframeMouseEnter = useCallback((index: number) => setHover(index), []);
  const handleTimeframeMouseLeave = useCallback(() => setHover(null), []);
  const handleCompareBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdown(prev => !prev);
  }, []);
  const handleDropdownClose = useCallback(() => setDropdown(false), []);
  const handleSelectionChange = useCallback((newSelected: string[]) => setSelected(newSelected), []);

  // Оптимизированный getActiveDot
  const getActiveDot = useCallback((color: string) => {
    const ActiveDot = (props: any) => (
      <circle
        cx={props.cx}
        cy={props.cy}
        r={7}
        fill={color}
        stroke={colors.text.primary}
        strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 4px ${color}55)` }}
      />
    );
    return ActiveDot;
  }, []);

  // Effects с оптимизированными зависимостями
  useEffect(() => {
    if (dropdown && ref.current) {
      setDropdownWidth(ref.current.offsetWidth);
    }
  }, [dropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdown && 
          ref.current && 
          !ref.current.contains(event.target as Node) && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        handleDropdownClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdown, handleDropdownClose]);

  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 800);
    return () => clearTimeout(timer);
  }, [tf, selected, data]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Оптимизированный рендер линий
  const renderChartLines = useMemo(() => (
    <>
      {/* Axylon's vault - отображается всегда */}
      <Line 
        type="monotone" 
        dataKey="Axylon's vault" 
        stroke={colors.primary}
        strokeWidth={3} 
        dot={false} 
        activeDot={getActiveDot(colors.primary)} 
        isAnimationActive={shouldAnimate}
      />
      
      {/* Остальные линии отображаются только если выбраны */}
      {selected.includes('Bitcoin') && (
        <Line 
          type="monotone" 
          dataKey="Bitcoin" 
          stroke={colors.chart.bitcoin}
          strokeWidth={2} 
          dot={false} 
          activeDot={getActiveDot(colors.chart.bitcoin)} 
          isAnimationActive={shouldAnimate}
        />
      )}
      {selected.includes('Ethereum') && (
        <Line 
          type="monotone" 
          dataKey="Ethereum" 
          stroke={colors.chart.ethereum}
          strokeWidth={2} 
          dot={false} 
          activeDot={getActiveDot(colors.chart.ethereum)} 
          isAnimationActive={shouldAnimate}
        />
      )}
      {selected.includes('Hyperliquid') && (
        <Line 
          type="monotone" 
          dataKey="Hyperliquid" 
          stroke={colors.chart.hyperliquid}
          strokeWidth={2} 
          dot={false} 
          activeDot={getActiveDot(colors.chart.hyperliquid)} 
          isAnimationActive={shouldAnimate}
        />
      )}
      {selected.includes('SP500') && (
        <Line 
          type="monotone" 
          dataKey="SP500" 
          stroke={colors.chart.sp500}
          strokeWidth={2} 
          dot={false} 
          activeDot={getActiveDot(colors.chart.sp500)} 
          isAnimationActive={shouldAnimate}
        />
      )}
      {selected.includes('Gold') && (
        <Line 
          type="monotone" 
          dataKey="Gold" 
          stroke={colors.chart.gold}
          strokeWidth={2} 
          dot={false} 
          activeDot={getActiveDot(colors.chart.gold)} 
          isAnimationActive={shouldAnimate}
        />
      )}
    </>
  ), [selected, shouldAnimate, getActiveDot]);

  // Компонент загрузки
  const LoadingComponent = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '300px',
      color: colors.text.secondary,
      fontFamily: 'Outfit',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Spinner />
        Загрузка данных...
      </div>
    </div>
  );

  // Компонент ошибки
  const ErrorComponent = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '300px',
      color: colors.text.secondary,
      fontFamily: 'Outfit',
      fontSize: '14px',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ color: '#E64343', marginBottom: '8px' }}>⚠️ {error}</div>
        <button 
          onClick={() => loadData(activeTf)}
          style={{
            background: colors.primary,
            color: colors.text.primary,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'Outfit'
          }}
        >
          Повторить попытку
        </button>
      </div>
    </div>
  );

  return (
    <ChartBlock>
      <FiltersRow style={{ position: 'relative' }}>
        <TimeframeFilter
          timeframes={timeframeOptions}
          activeIndex={tf}
          hoverIndex={hover}
          onClick={handleTimeframeClick}
          onMouseEnter={handleTimeframeMouseEnter}
          onMouseLeave={handleTimeframeMouseLeave}
        />
        <CompareButton ref={ref} onClick={handleCompareBtnClick}>
          <CompareButtonContent>
            Compare with <AnimatedPlus open={dropdown} />
          </CompareButtonContent>
        </CompareButton>
        <CompareWithDropdown
          ref={dropdownRef}
          open={dropdown}
          selected={selected}
          setSelected={handleSelectionChange}
          onClose={handleDropdownClose}
          anchorWidth={dropdownWidth}
          options={compareOptions}
        />
      </FiltersRow>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {loading ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <LoaderDiv><div /></LoaderDiv>
          </div>
        ) : error ? (
          <ErrorComponent />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataWithIndex} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              {CartesianGridMemo}
              {ReferenceLinesEdge}
              {/* Вертикальные пунктирные линии по ключевым датам/времени */}
              {xLabelIndexes.map(idx => (
                <ReferenceLine
                  key={idx}
                  x={idx}
                  stroke={colors.text.tertiary}
                  strokeDasharray="2 4"
                  strokeWidth={0.5}
                  ifOverflow="extendDomain"
                />
              ))}
              {XAxisMemo}
              {YAxisMemo}
              {TooltipMemo}
              {renderChartLines}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartBlock>
  );
};

export default React.memo(MainChart); 