import React, { useMemo, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { calcDrawdown } from '../../utils/metrics';
import { useAllMetrics } from '../../hooks/useAllMetrics';
import CountUp from 'react-countup';

const MetricCard = styled.div`
  background: ${({ theme }) => theme.metricCardBg};
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: 100px;
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  @media (max-width: 1024px) and (min-width: 768px) {
    height: 100px;
    padding: 16px !important;
  }
  @media (max-width: 767px) {
    height: 100px;
    min-height: 100px;
    max-height: 100px;
    padding: 16px !important;
  }
`;

const CardLabel = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const CardValue = styled.div<{color?: string}>`
  color: ${({ color, theme }) => (color === '#E64343' || color === '#179646') ? color : theme.metricCardValue};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 24px;
  font-weight: 700;
  @media (max-width: 767px) {
    font-size: 20px;
    font-weight: 600;
  }
`;

function AnimatedValue({ value, prevValue, prefix = '', suffix = '', decimals = 0, separator = ' ' }: { value: number; prevValue: number; prefix?: string; suffix?: string; decimals?: number; separator?: string }) {
  return (
    <CountUp
      start={prevValue}
      end={value}
      duration={1.2}
      separator={separator}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
    />
  );
}

interface MetricCardsProps {
  plValue: number;
  axylonSeries: number[];
  freq: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ plValue, axylonSeries, freq }) => {
  const { tvl, volume, sharpe, volatility, loading } = useAllMetrics(freq);
  const plColor = plValue >= 0 ? '#179646' : '#E64343';
  const drawdown = useMemo(() => calcDrawdown(axylonSeries), [axylonSeries]);

  // Сохраняем предыдущее состояние всех метрик для синхронной анимации
  const [prevMetrics, setPrevMetrics] = useState({
    volume: 0,
    drawdown: 0,
    volatility: 0,
    tvl: 0,
    plValue: 0,
    sharpe: 0,
  });
  const [displayMetrics, setDisplayMetrics] = useState({
    volume: 0,
    drawdown: 0,
    volatility: 0,
    tvl: 0,
    plValue: 0,
    sharpe: 0,
  });
  const wasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!loading) {
      // Если данные загрузились хотя бы раз, больше не сбрасываем в 0
      wasLoadedOnce.current = true;
      setPrevMetrics(displayMetrics);
      setDisplayMetrics({
        volume: volume === null || isNaN(volume) ? 0 : volume,
        drawdown: drawdown === null || isNaN(drawdown) ? 0 : drawdown,
        volatility: volatility === null || isNaN(volatility) ? 0 : volatility,
        tvl: tvl === null || isNaN(tvl) ? 0 : tvl,
        plValue: plValue === null || isNaN(plValue) ? 0 : plValue,
        sharpe: sharpe === null || isNaN(sharpe) ? 0 : sharpe,
      });
    }
    // При первом рендере, если данных не было, показываем 0
    if (loading && !wasLoadedOnce.current) {
      setDisplayMetrics({
        volume: 0,
        drawdown: 0,
        volatility: 0,
        tvl: 0,
        plValue: 0,
        sharpe: 0,
      });
      setPrevMetrics({
        volume: 0,
        drawdown: 0,
        volatility: 0,
        tvl: 0,
        plValue: 0,
        sharpe: 0,
      });
    }
    // Если loading, но данные уже были — ничего не делаем, оставляем старые значения
  }, [loading, volume, drawdown, volatility, tvl, plValue, sharpe]);

  return (
    <>
      <MetricCard key="Volume">
        <CardLabel>Volume</CardLabel>
        <CardValue color="#F5F5F5">
          <AnimatedValue value={displayMetrics.volume} prevValue={prevMetrics.volume} prefix="$" decimals={0} separator=" " />
        </CardValue>
      </MetricCard>
      <MetricCard key="Max Drawdown">
        <CardLabel>Max Drawdown</CardLabel>
        <CardValue color="#E64343">
          <AnimatedValue value={displayMetrics.drawdown} prevValue={prevMetrics.drawdown} suffix="%" decimals={2} separator=" " />
        </CardValue>
      </MetricCard>
      <MetricCard key="Volatility">
        <CardLabel>Volatility</CardLabel>
        <CardValue color="#F5F5F5">
          <AnimatedValue value={displayMetrics.volatility} prevValue={prevMetrics.volatility} suffix="%" decimals={2} separator=" " />
        </CardValue>
      </MetricCard>
      <MetricCard key="TVL">
        <CardLabel>TVL</CardLabel>
        <CardValue color="#F5F5F5">
          <AnimatedValue value={displayMetrics.tvl} prevValue={prevMetrics.tvl} prefix="$" decimals={0} separator=" " />
        </CardValue>
      </MetricCard>
      <MetricCard key="P&L">
        <CardLabel>P&L</CardLabel>
        <CardValue color={plColor}>
          <AnimatedValue value={displayMetrics.plValue} prevValue={prevMetrics.plValue} suffix="%" decimals={2} separator=" " />
        </CardValue>
      </MetricCard>
      <MetricCard key="Sharpe Ratio">
        <CardLabel>Sharpe Ratio</CardLabel>
        <CardValue color="#F5F5F5">
          <AnimatedValue value={displayMetrics.sharpe} prevValue={prevMetrics.sharpe} decimals={2} separator=" " />
        </CardValue>
      </MetricCard>
    </>
  );
}; 