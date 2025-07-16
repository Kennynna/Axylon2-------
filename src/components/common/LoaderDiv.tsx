import styled from 'styled-components';

const LoaderDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex: 1;
  width: 100%;
  @media (max-width: 1024px) and (min-width: 768px) {
    min-height: 328px;
  }
  @media (max-width: 767px) {
    min-height: 320px;
  }
  @media (min-width: 1440px) {
    min-height: 480px;
  }
  & > div {
    border: 3px solid ${({ theme }) => theme.background === '#1A1A1A' ? '#1a1a1a' : '#f3f3f3'};
    border-top: 3px solid #C9184A;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

export default LoaderDiv; 