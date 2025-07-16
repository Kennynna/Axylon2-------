import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../constants/theme';

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

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${colors.text.secondary};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
`;

const Loader: React.FC<{text?: string}> = ({ text = 'Загрузка данных...' }) => (
  <LoaderWrapper>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Spinner />
      {text}
    </div>
  </LoaderWrapper>
);

export default Loader; 