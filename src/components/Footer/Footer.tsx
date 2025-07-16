import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  background: ${({ theme }) => theme.footerBg};
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  @media (max-width: 1024px) {
    padding-top: 16px;
    padding-bottom: 16px;
  }
  @media (max-width: 768px) {
    padding-top: 16px;
    padding-bottom: 16px;
  }
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  @media (max-width: 1024px) {
    padding: 0 16px;
  }
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 767px) {
    gap: 16px;
  }
`;

const Copyright = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-weight: 400;
  @media (min-width: 768px) {
    font-size: 14px;
    font-family: 'Outfit', 'Outfit Fallback';
    font-weight: 400;
  }
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: none;
  transition: transform 0.2s;
  transform-origin: center;
  will-change: transform;
  &:hover {
    transform: scale(1.04);
  }
  @media (max-width: 767px) {
    width: 28px;
    height: 28px;
  }
`;

const IconImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Footer: React.FC = () => (
  <FooterContainer>
    <Content>
      <Copyright>© 2025 Axylon. All Rights Reserved.</Copyright>
      <Socials>
        <SocialIcon href="https://t.me/axyloncapital" title="Telegram" target="_blank" rel="noopener noreferrer">
          <IconImg src={require('../../assets/icons/tg-red-logo-dark.svg').default} alt="Telegram" />
        </SocialIcon>
        <SocialIcon href="https://x.com/axylon_" title="X" target="_blank" rel="noopener noreferrer">
          <IconImg src={require('../../assets/icons/x-red-logo-dark.svg').default} alt="X" />
        </SocialIcon>
        <SocialIcon href="https://app.hyperliquid.xyz/vaults/0xb3ce8b2e01a0fe858c498a24302bd5dbad48aef2" title="Hyperliquid" target="_blank" rel="noopener noreferrer">
          <IconImg src={require('../../assets/icons/hyper-red-logo-dark.svg').default} alt="Hyperliquid" />
        </SocialIcon>
      </Socials>
    </Content>
  </FooterContainer>
);

export default Footer;