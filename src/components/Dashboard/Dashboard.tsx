import React from 'react';
import styled, { css } from 'styled-components';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import PieChart from '../PieChart/PieChart';
import MainChart from '../MainChart/MainChart';
import PositionsTable from '../PositionsTable/PositionsTable';
import { MetricCards } from '../MetricCards/MetricCards';
import { getChartData } from '../../services/apiService';
import { timeframes, Timeframe } from '../MainChart/MainChart.types';
import { useEffect, useState, useCallback } from 'react';
import { useAllMetrics } from '../../hooks/useAllMetrics';
import { InfoCard } from '../InfoCards/InfoCards';

// Сопоставление таймфрейма с freq для API
function tfToFreqApi(tf: string): string {
  if (tf === '1d') return 'day';
  if (tf === '7d') return 'week';
  if (tf === '30d') return 'month';
  if (tf === 'All') return 'allTime';
  return 'day';
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: 76px;
  @media (max-width: 1024px) {
    padding-top: 69px;
  }
  @media (max-width: 767px) {
    padding-top: 60px;
  }
`;

const GridContainer = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  grid-auto-rows: min-content;
  min-height: 0;
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 16px;
  }
  @media (max-width: 767px) {
    padding: 16px 16px 16px 16px;
    gap: 16px;
  }
`;

const PieChartGrid = styled.div`
  grid-column: 1;
  grid-row: 2;
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    grid-row: 3;
  }
`;

const MainChartGrid = styled.div`
  grid-column: 2 / span 4;
  grid-row: 2;
  display: flex;
  justify-content: flex-start;
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    grid-row: 4;
  }
`;

const TableGrid = styled.div`
  grid-column: 1 / span 5;
  grid-row: 3;
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    grid-row: auto;
  }
`;

const CardWrapper = styled.div<{ spanRows?: number; order?: number }>`
  grid-column: span 1;
  ${props => props.spanRows ? `grid-row: span ${props.spanRows};` : ''}
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-column: 3;
    grid-row: auto;
    width: 100%;
    display: block;
    margin: 0 0 0px 0;
    &:last-child { margin-bottom: 0; }
  }
`;

// Стили для одной MetricCard
const MetricCardBox = styled.div<{color?: string}>`
  background: ${({ theme }) => theme.metricCardBg};
  border-radius: 10px;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  @media (max-width: 767px) {
    height: 100px;
    min-height: 100px;
    max-height: 100px;
    padding: 16px;
    overflow: hidden;
  }
`;
const MetricLabel = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 400;
  margin-bottom: 0;
  @media (max-width: 767px) {
    font-size: 12px;
  }
`;
const MetricValue = styled.div<{color?: string}>`
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 24px;
  font-weight: 700;
  color: ${({ color, theme }) => (color === '#E64343' || color === '#179646') ? color : theme.metricCardValue};
  @media (max-width: 767px) {
    font-size: 20px;
    font-weight: 600;
  }
`;

// Стили для одной InfoCard
const InfoCardBox = styled.div`
  background: ${({ theme }) => theme.infoCardBg};
  border-radius: 10px;
  height: 220px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: background-color 0.3s, color 0.3s;
  cursor: pointer;
  width: 100%;
  &:hover {
    background: #C9184A;
    & > *, & > * > * {
      color: #F5F5F5 !important;
      transition: color 0.3s;
    }
  }
  @media (max-width: 1024px) and (min-width: 768px) {
    height: 158px;
    min-height: 0;
    max-height: none;
  }
  @media (max-width: 767px) {
    height: 100px;
    min-height: 100px;
    max-height: 100px;
    padding: 16px;
    overflow: hidden;
  }
`;
const InfoTitle = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 700;
  font-size: 24px;
  color: ${({ theme }) => theme.textAccent};
  line-height: 1.3;
  text-align: center;
  transition: color 0.3s;
  margin-bottom: 8px;
  @media (max-width: 767px) {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 2px;
    margin-top: 0;
  }
`;
const InfoDescription = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.3;
  text-align: center;
  transition: color 0.3s;
  margin-top: 0;
  @media (max-width: 767px) {
    font-size: 12px;
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const metrics = [
  { label: 'Volume', value: '$23 256', color: '#F5F5F5' },
  { label: 'Max Drawdown', value: '-0.23%', color: '#E64343' },
  { label: 'Volatility', value: '0%', color: '#F5F5F5' },
  { label: 'TVL', value: '$20 343', color: '#F5F5F5' },
  { label: 'P&L', value: '3.12%', color: '#179646' },
  { label: 'Sharpe Ratio', value: '0', color: '#F5F5F5' },
];

const infoCards = [
  { title: 'FAQ', description: 'Learn more about vault and how it works' },
  { title: 'Join Vault', description: 'Start investing with automated trading strategies' },
];

const MetricCard: React.FC<{label: string; value: string; color?: string}> = ({label, value, color}) => (
  <MetricCardBox color={color}>
    <MetricLabel>{label}</MetricLabel>
    <MetricValue color={color}>{value}</MetricValue>
  </MetricCardBox>
);

const OverlayBg = styled.div`
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: ${({ theme }) => theme.faqOverlayBg};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;
const OverlayWindow = styled.div`
  background: ${({ theme }) => theme.faqWindowBg};
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  max-width: 650px;
  max-height: 70vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow-y: auto;
  /* Скрыть скроллбар, но оставить скролл */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
`;
const OverlayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  min-height: 34px;
  @media (max-width: 340px) {
    flex-direction: column-reverse;
    align-items: flex-start;
    min-height: unset;
  }
`;
const OverlayTitleBg = styled.div`
  background: ${({ theme }) => theme.faqTitleBg};
  border-radius: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  @media (max-width: 340px) {
    margin-top: 0;
  }
`;
const OverlayTitle = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 700;
  font-size: 24px;
  color: ${({ theme }) => theme.faqTitleText};
  text-align: left;
  @media (max-width: 767px) {
    font-size: 20px;
    font-weight: 600;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: #C9184A;
  border: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px;
  @media (max-width: 340px) {
    position: static;
    align-self: flex-start;
    margin-bottom: 10px;
    margin-left: 0;
    top: unset;
    right: unset;
    transform: none;
  }
`;
const CloseIcon = styled.img`
  width: 10px;
  height: 10px;
`;
const QAList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const QATitle = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 600;
  font-size: 20px;
  color: ${({ theme }) => theme.faqQuestion};
  margin-bottom: 10px;
  @media (max-width: 767px) {
    font-size: 18px;
    font-weight: 600;
  }
`;
const QAAnswer = styled.div`
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.faqAnswer};
  line-height: 1.3;
  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 400;
  }
`;

const QAWrapper = styled.div`
  background: ${({ theme }) => theme.faqWrapperBg};
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const FAQ_DATA = [
  {
    q: "What lies behind the name Axylon?",
    a: "Axylon is an algorithmic hedge fund that originally operated as a family office in stealth mode for years. During this time, we fine-tuned numerous trading strategies, rigorously testing them through simulations and real market trades, consistently achieving strong results. Now, ready for new challenges, we're opening up to external liquidity. Our first step into the world is launching a vault on Hyperliquid, a product that demonstrates our real profitability on the blockchain. Looking ahead, we plan to expand further by introducing an API-broker with our trading strategies for centralized exchanges (CEXs), bringing our expertise to a broader audience."
  },
  {
    q: "How do Axylon's trading algorithms work?",
    a: "Our fully automated system allocates capital across momentum, mean-reversion, and delta-neutral strategies to ensure efficiency in any market environment. The portfolio is rebalanced based on P&L, drawdowns, and Sharpe Ratio, dynamically scaling exposure to maintain resilience during volatile markets. Designed for robust performance, it delivers solid returns, even during market crashes, unaffected by market conditions."
  },
  {
    q: "Why do the vault metrics on Hyperliquid and Axylon's dashboard differ?",
    a: "The metrics differ because Hyperliquid calculates vault profitability collectively, without accounting for individual user deposits, withdrawals, or the revenue share paid to the vault owner for profitable trades. To provide greater transparency, Axylon's dashboard offers detailed analytics and accurate profitability metrics for past periods. This is achieved through a dedicated tracking wallet that participates in the vault as a regular user. By monitoring this wallet's profitability from the vault's first trade, we ensure precise, comprehensive statistics for the entire duration of the vault's existence. *keep in mind that strong historical profitability does not guarantee future results."
  },
  {
    q: "How is the Sharpe Ratio calculated?",
    a: "The Sharpe Ratio measures a portfolio's risk-adjusted return and is calculated as the portfolio's average return minus the risk-free rate, divided by the portfolio's standard deviation (volatility). For the risk-free rate in our calculations, we use the average annual percentage rate (APR) over the past year for staking $USDC on AAVE's Ethereum Mainnet, which is 4.89%."
  },
];

function FAQOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <OverlayBg onClick={onClose}>
      <OverlayWindow onClick={e => e.stopPropagation()}>
        <OverlayHeader>
          <OverlayTitleBg>
            <OverlayTitle>Frequently Asked Questions</OverlayTitle>
          </OverlayTitleBg>
          <CloseBtn onClick={onClose} aria-label="Close FAQ">
            <CloseIcon src={require('../../assets/icons/krestik-faq.svg').default} alt="close" />
          </CloseBtn>
        </OverlayHeader>
        <QAWrapper>
          <QAList>
            {FAQ_DATA.map((item, i) => (
              <div key={i}>
                <QATitle>{item.q}</QATitle>
                <QAAnswer>{item.a}</QAAnswer>
              </div>
            ))}
          </QAList>
        </QAWrapper>
      </OverlayWindow>
    </OverlayBg>
  );
}

const MetricsGrid = styled.div`
  grid-column: 1 / span 3;
  grid-row: 1 / span 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 100px);
  gap: 20px;
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-column: 1 / span 2;
    grid-row: 1 / span 3;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 100px);
    gap: 16px;
  }
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 100px);
    gap: 16px;
    grid-column: 1 / -1;
  }
`;

const InfoCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-column: 4;
    grid-row: 1 / span 2;
    width: 100%;
  }
`;

const DashboardContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding-top: 80px;
  padding-bottom: 40px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  color: ${({ theme }) => theme.text};
`;

const CardTitle = styled.div`
  color: ${({ theme }) => theme.textAccent};
  font-size: 18px;
  font-weight: 600;
`;

const CardValue = styled.div<{color?: string}>`
  color: ${({ color, theme }) => color || theme.text};
  font-size: 24px;
  font-weight: 700;
`;

const CardLabel = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 400;
  @media (max-width: 767px) {
    font-size: 10px;
  }
`;

// Добавляю InfoCardsMobile
const InfoCardGridItem = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: block;
    grid-column: 1 / -1;
    margin-bottom: 0;
    min-height: 100px;
    height: 100px;
    max-height: 100px;
    overflow: hidden;
  }
`;

const Dashboard: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState(false);
  // --- Новое состояние для графика и таймфрейма ---
  const [tf, setTf] = useState<number>(2); // индекс 2 — это '30d' в timeframes
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeTf = timeframes[tf] as Timeframe;
  // Удаляю useEffect для загрузки TVL и Volume

  const loadChartData = useCallback(async (timeframe: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChartData(timeframe);
      setChartData(data);
    } catch (err) {
      setError('Error loading chart data');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChartData(activeTf);
  }, [activeTf, loadChartData]);

  const { tvl, volume, sharpe, volatility } = useAllMetrics(tfToFreqApi(activeTf));

  // --- Получаем доходность за рабочий таймфрейм (P&L) Axylon's vault ---
  const plValue = chartData.length > 1
    ? chartData[chartData.length - 1]["Axylon's vault"] - chartData[0]["Axylon's vault"]
    : 0;
  // --- Массив значений Axylon's vault для drawdown ---
  const axylonSeries = chartData.map((d) => d["Axylon's vault"]);

  return (
    <PageWrapper>
      <Header />
      <FAQOverlay open={faqOpen} onClose={() => setFaqOpen(false)} />
      <GridContainer>
        <MetricsGrid>
          {/* Info Cards для мобильных — только для max-width: 767px */}
          <InfoCardGridItem className="mobile-info-card">
            <InfoCard
              title={infoCards[1].title}
              description={infoCards[1].description}
              asLink
              href="https://app.hyperliquid.xyz/vaults/0xb3ce8b2e01a0fe858c498a24302bd5dbad48aef2"
            />
          </InfoCardGridItem>
          <InfoCardGridItem className="mobile-info-card">
            <InfoCard
              title={infoCards[0].title}
              description={infoCards[0].description}
              onClick={() => setFaqOpen(true)}
              clickable
            />
          </InfoCardGridItem>
          {/* Метрики */}
          <MetricCards
            plValue={plValue}
            axylonSeries={axylonSeries}
            freq={tfToFreqApi(activeTf)}
          />
        </MetricsGrid>
        {/* Info Cards для десктопа и планшета */}
        <JoinVaultCardWrapper order={1} className="desktop-info-card">
          <InfoCard
            title={infoCards[1].title}
            description={infoCards[1].description}
            asLink
            href="https://app.hyperliquid.xyz/vaults/0xb3ce8b2e01a0fe858c498a24302bd5dbad48aef2"
          />
        </JoinVaultCardWrapper>
        <FAQCardWrapper order={2} className="desktop-info-card">
          <InfoCard
            title={infoCards[0].title}
            description={infoCards[0].description}
            onClick={() => setFaqOpen(true)}
            clickable
          />
        </FAQCardWrapper>
        {/* Далее графики и таблица */}
        <PieChartGrid>
          <PieChart />
        </PieChartGrid>
        <MainChartGrid>
          <MainChart
            tf={tf}
            setTf={setTf}
            data={chartData}
            loading={loading}
            error={error}
          />
        </MainChartGrid>
        <TableGrid>
          <PositionsTable />
        </TableGrid>
      </GridContainer>
      <Footer />
    </PageWrapper>
  );
};

const InfoCardsGridFix = css`
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-column: 3 !important;
  }
`;

const JoinVaultCardWrapper = styled(CardWrapper)`
  ${InfoCardsGridFix}
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-row: 1 !important;
    order: 1;
  }
  @media (max-width: 767px) {
    display: none !important;
  }
`;

const FAQCardWrapper = styled(CardWrapper)`
  ${InfoCardsGridFix}
  @media (max-width: 1024px) and (min-width: 768px) {
    grid-row: 2 !important;
    order: 2;
  }
  @media (max-width: 767px) {
    display: none !important;
  }
`;

export default Dashboard; 