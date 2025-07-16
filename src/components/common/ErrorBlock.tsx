import React from 'react';
import styled from 'styled-components';
import { colors } from '../../constants/theme';

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${colors.text.secondary};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  text-align: center;
`;

const RetryButton = styled.button`
  background: ${colors.primary};
  color: ${colors.text.primary};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: Outfit;
`;

const ErrorBlock: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <ErrorWrapper>
    <div>
      <div style={{ color: '#E64343', marginBottom: '8px' }}>⚠️ {error}</div>
      <RetryButton onClick={onRetry}>Повторить попытку</RetryButton>
    </div>
  </ErrorWrapper>
);

export default ErrorBlock; 