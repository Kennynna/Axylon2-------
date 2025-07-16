import React from 'react';
import styled from 'styled-components';

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
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { width: 0; height: 0; display: none; }
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
  font-size: 20px;
  font-weight: 600;
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

const FAQOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
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
};

export default FAQOverlay; 