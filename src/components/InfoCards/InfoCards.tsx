import React from 'react';
import styled from 'styled-components';

const CardsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 25px;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: auto;

  @media (max-width: 1024px) and (min-width: 768px) {
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: stretch;
    background: red; /* временно для проверки */
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  color: ${({ theme }) => theme.text};
  width: 258px;
  height: 225px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;

  @media (max-width: 1024px) and (min-width: 768px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
`;

const CardTitle = styled.div`
  color: ${({ theme }) => theme.textAccent};
  font-size: 18px;
  font-weight: 600;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

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

export const InfoCard: React.FC<{
  title: string;
  description: string;
  asLink?: boolean;
  href?: string;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ title, description, asLink, href, onClick, clickable }) => {
  const content = (
    <InfoCardBox onClick={onClick} style={clickable ? { cursor: 'pointer' } : {}}>
      <InfoTitle>{title}</InfoTitle>
      <InfoDescription>{description}</InfoDescription>
    </InfoCardBox>
  );
  if (asLink && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%', height: '100%' }}>
        {content}
      </a>
    );
  }
  return content;
};

const InfoCards: React.FC = () => (
  <CardsRow>
    <Card>
      <CardTitle>Join Vault</CardTitle>
      <CardDescription>Start investing with automated trading strategies</CardDescription>
    </Card>
    <Card>
      <CardTitle>FAQ</CardTitle>
      <CardDescription>Learn more about vault and how it works</CardDescription>
    </Card>
  </CardsRow>
);

export default InfoCards; 