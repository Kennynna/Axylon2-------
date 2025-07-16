import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import styled from 'styled-components';
import { colors } from '../../constants/theme';
import FilterArrowIcon from '../../assets/icons/filter-arrow-icon.svg';
import { getStatistics, formatStatisticsData, FLAG_MAP } from '../../services/statisticsService';
import Loader from '../common/Loader';
import LoaderDiv from '../common/LoaderDiv';

const PieChartBlock = styled.div`
  background: ${({ theme }) => theme.pieChartBg};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  gap: 20px;
  @media (max-width: 1024px) and (min-width: 768px) {
    min-height: 328px;
    max-height: 328px;
  }
  @media (max-width: 767px) {
    margin-right: 0;
    width: calc(100%);
    padding: 16px;
  }
`;

const PieChartTitle = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.textAccent};
  margin-bottom: 18px;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const PieChartFilterRow = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 1024px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const PieChartFilterLabel = styled.span`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.pieChartText};
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const RankByButton = styled.button`
  display: flex;
  align-items: center;
  background: #C9184A;
  color: #F5F5F5;
  border: none;
  border-radius: 5px;
  padding: 5px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  outline: none;
  transition: background 0.15s;
  height: auto;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const RankByText = styled.span`
  display: inline-block;
`;

const RankByIcon = styled.img`
  width: 12px;
  height: 5px;
  margin-left: 5px;
  display: inline-block;
`;

const DonutChartWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 240px;
  margin: 0 auto 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 1439px) and (min-width: 1025px) {
    max-width: clamp(140px, 18vw, 240px);
  }
  @media (min-width: 1440px) {
    max-width: 320px;
  }
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const DonutToken = styled.div<{color: string}>`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 16px;
  font-weight: 400;
  color: ${({ color }) => color};
  margin-bottom: 2px;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const DonutPercent = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.background === '#F5F5F5' ? '#1a1a1a' : '#fff'};
  margin-bottom: 2px;
  @media (max-width: 767px) {
    font-size: 20px;
    font-weight: 600;
  }
`;

const DonutValue = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 16px;
  font-weight: 400;
  color: #17C964;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const PieChartLegend = styled.div`
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 5px;
  row-gap: 20px;
  width: 100%;
  justify-content: space-between;
`;

const PieChartLegendItem = styled.div`
  display: grid;
  grid-template-columns: 16px 72px 56px;
  align-items: center;
  gap: 0;
`;

const PieChartTokenRow = styled.span`
  display: flex;
  align-items: center;
`;

const PieChartColorDot = styled.span<{color: string}>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({color}) => color};
  display: inline-block;
`;

const PieChartTokenName = styled.span`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.pieChartText};
  width: 64px;
  min-width: 64px;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const PieChartTokenValue = styled.span`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.pieChartText};
  text-align: right;
  margin-left: 0;
  padding-left: 0;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;

const data = [
  { name: 'BTC', value: 95, usd: '$17.87', color: '#FF8A00' },
  { name: 'ETH', value: 3, usd: '$0.56', color: '#9A9A9A' },
  { name: 'USDT', value: 2, usd: '$0.37', color: '#00FFA6' },
  { name: 'SOL', value: 1, usd: '$0.20', color: '#A259FF' },
  { name: 'XRP', value: 1, usd: '$0.15', color: '#F5F5F5' },
  { name: 'DOGE', value: 1, usd: '$0.10', color: '#17C964' },
  { name: 'ADA', value: 1, usd: '$0.08', color: '#FF0080' },
  { name: 'DOT', value: 1, usd: '$0.05', color: '#F31260' },
  { name: 'MATIC', value: 0.5, usd: '$0.03', color: '#8247E5' },
  { name: 'AVAX', value: 0.3, usd: '$0.02', color: '#E84142' },
];

const rankOptions = [
  'Net P&L',
  'Volume',
  'Fees',
  'Trades',
];

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: ${({ theme }) => theme.background === '#F5F5F5' ? '#f5f5f5' : '#1a1a1a'};
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  min-width: 120px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  @media (max-width: 1024px) {
    left: auto;
    right: 0;
  }
`;

const DropdownItem = styled.div<{
  $active?: boolean;
  $hovered?: boolean;
  $first?: boolean;
  $last?: boolean;
  $nextActive?: boolean;
  $nextHovered?: boolean;
  $prevActive?: boolean;
  $prevHovered?: boolean;
}>`
  padding: 5px;
  display: flex;
  align-items: center;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({$active, $hovered}) => ($active || $hovered ? '#F5F5F5' : '#9A9A9A')};
  background: ${({$active, $hovered}) => ($active || $hovered ? '#C9184A' : 'transparent')};
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
  transition: background 0.15s, color 0.15s, border-radius 0.15s;
  @media (max-width: 767px) {
    font-size: 12px;
    font-family: 'Outfit', 'Outfit Fallback';
    font-weight: 400;
  }
`;

const HOVER_RADIUS_DELTA = 6;
const OUTER_RADIUS_DEFAULT = 90;
const OUTER_RADIUS_LARGE = 120;
const OUTER_RADIUS_STEP_UP = 0.3;   // шаг при увеличении
const OUTER_RADIUS_APPROACH = 0.08; // скорость приближения при уменьшении
const INNER_RADIUS_DEFAULT = 68;
const INNER_RADIUS_LARGE = 90;

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, cornerRadius } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={cornerRadius}
    />
  );
};

// Функция для определения цвета значения
const getValueColor = (value: string, type: string) => {
  // For Trades, always use default color
  if (type === 'Trades') {
    return '#9A9A9A';
  }
  // For Fees, always red
  if (type === 'Fees') {
    return '#E64343';
  }
  const num = Number(value.replace(/[$,\s-]/g, '')) * (value.startsWith('-') ? -1 : 1);
  // For other types (Net P&L, Volume)
  return num >= 0 ? '#179646' : '#E64343';
};

const PieChartContentRow = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 24px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
  @media (max-width: 1024px) and (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 32px;
  }
  @media (max-width: 767px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const PieChart: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState(rankOptions[0]);
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [btnWidth, setBtnWidth] = useState<number | undefined>(undefined);
  const [animatedRadius, setAnimatedRadius] = useState(OUTER_RADIUS_DEFAULT);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const outerRadius = useMemo(() => (windowWidth >= 1440 ? OUTER_RADIUS_LARGE : OUTER_RADIUS_DEFAULT), [windowWidth]);
  const innerRadius = useMemo(() => (windowWidth >= 1440 ? INNER_RADIUS_LARGE : INNER_RADIUS_DEFAULT), [windowWidth]);
  const animatedOuterRadius = hoveredIndex !== undefined ? (windowWidth >= 1440 ? OUTER_RADIUS_LARGE + HOVER_RADIUS_DELTA : OUTER_RADIUS_DEFAULT + HOVER_RADIUS_DELTA) : outerRadius;

  // Load data when selected option changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const flag = FLAG_MAP[selected];
        const response = await getStatistics(flag);
        const formattedData = formatStatisticsData(response, flag);
        setData(formattedData);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selected]);

  // Сортируем данные: самый большой сегмент первым, мемоизировано
  const clockwiseData = React.useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const active = clockwiseData[selectedIndex];

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    if (dropdownOpen && btnRef.current) {
      setBtnWidth(btnRef.current.offsetWidth);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      const target = hoveredIndex !== undefined ? OUTER_RADIUS_DEFAULT + HOVER_RADIUS_DELTA : OUTER_RADIUS_DEFAULT;
      setAnimatedRadius(prev => {
        if (prev < target) {
          // Увеличение — быстрый фиксированный шаг
          if (Math.abs(prev - target) < OUTER_RADIUS_STEP_UP) return target;
          return prev + OUTER_RADIUS_STEP_UP;
        } else {
          // Уменьшение — плавное приближение
          if (Math.abs(prev - target) < 0.1) return target;
          return prev + (target - prev) * OUTER_RADIUS_APPROACH;
        }
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [hoveredIndex]);

  if (loading) {
    return (
      <PieChartBlock>
        <PieChartFilterRow style={{ position: 'relative' }}>
          <RankByButton ref={btnRef}>
            <RankByText>Rank by</RankByText>
            <RankByIcon src={FilterArrowIcon} alt="arrow" />
          </RankByButton>
        </PieChartFilterRow>
        <PieChartContentRow>
          <LoaderDiv><div /></LoaderDiv>
        </PieChartContentRow>
      </PieChartBlock>
    );
  }

  if (error || !clockwiseData.length) {
    return (
      <PieChartBlock>
        <PieChartFilterRow style={{ position: 'relative' }}>
          <RankByButton ref={btnRef} onClick={() => setDropdownOpen(v => !v)}>
            <RankByText>Rank by</RankByText>
            <RankByIcon src={FilterArrowIcon} alt="arrow" />
          </RankByButton>
        </PieChartFilterRow>
        <PieChartContentRow>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', width: '100%' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '14px', color: '#9A9A9A' }}>
              {error || 'No data available'}
            </span>
          </div>
        </PieChartContentRow>
      </PieChartBlock>
    );
  }

  return (
    <PieChartBlock>
      <PieChartFilterRow style={{ position: 'relative' }}>
        <RankByButton ref={btnRef} onClick={() => setDropdownOpen(v => !v)}>
          <RankByText>Rank by</RankByText>
          <RankByIcon
            src={FilterArrowIcon}
            alt="arrow"
            style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }}
          />
        </RankByButton>
        {dropdownOpen && (
          <DropdownMenu ref={menuRef} style={btnWidth ? { minWidth: btnWidth } : {}}>
            {rankOptions.map((opt, i) => {
              const active = selected === opt;
              const isHovered = hoveredIndex === i;
              const first = i === 0;
              const last = i === rankOptions.length - 1;
              const nextActive = i < rankOptions.length - 1 && (selected === rankOptions[i + 1] || hoveredIndex === i + 1);
              const nextHovered = i < rankOptions.length - 1 && hoveredIndex === i + 1;
              const prevActive = i > 0 && (selected === rankOptions[i - 1] || hoveredIndex === i - 1);
              const prevHovered = i > 0 && hoveredIndex === i - 1;
              return (
                <DropdownItem
                  key={opt}
                  $active={active}
                  $hovered={isHovered}
                  $first={first}
                  $last={last}
                  $nextActive={nextActive}
                  $nextHovered={nextHovered}
                  $prevActive={prevActive}
                  $prevHovered={prevHovered}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(undefined)}
                  onClick={() => {
                    setSelected(opt);
                    setDropdownOpen(false);
                    setSelectedIndex(0);
                  }}
                >
                  {opt}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        )}
      </PieChartFilterRow>
      <PieChartContentRow>
        <DonutChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={clockwiseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                paddingAngle={2}
                stroke="none"
                cornerRadius={2}
                dataKey="value"
                isAnimationActive={false}
                startAngle={90}
                endAngle={-270}
                onMouseEnter={(_, idx) => {
                  setHoveredIndex(idx);
                  setSelectedIndex(idx);
                }}
                onMouseLeave={() => setHoveredIndex(undefined)}
                // @ts-ignore
                activeIndex={hoveredIndex}
                // @ts-ignore
                activeShape={(props: any) => renderActiveShape({ ...props, outerRadius: animatedOuterRadius })}
              >
                {clockwiseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
          <DonutCenter>
            {clockwiseData[selectedIndex] && (
              <>
                <DonutToken color={clockwiseData[selectedIndex].color}>{clockwiseData[selectedIndex].name}</DonutToken>
                <DonutPercent>{clockwiseData[selectedIndex].value.toFixed(2)}%</DonutPercent>
                <DonutValue style={{ color: getValueColor(clockwiseData[selectedIndex].usd, selected) }}>
                  {clockwiseData[selectedIndex].usd}
                </DonutValue>
              </>
            )}
          </DonutCenter>
        </DonutChartWrapper>
        <PieChartLegend>
          {clockwiseData.map((entry, idx) => (
            <PieChartLegendItem
              key={entry.name + idx}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                setSelectedIndex(idx);
              }}
              onMouseLeave={() => setHoveredIndex(undefined)}
              style={{ cursor: 'pointer' }}
            >
              <PieChartColorDot color={entry.color} />
              <PieChartTokenName>{entry.name}</PieChartTokenName>
              <PieChartTokenValue>{entry.value.toFixed(2)}%</PieChartTokenValue>
            </PieChartLegendItem>
          ))}
        </PieChartLegend>
      </PieChartContentRow>
    </PieChartBlock>
  );
};

export default PieChart; 