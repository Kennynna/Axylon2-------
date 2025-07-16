import React, { useState, useEffect } from 'react';
import styled, { useTheme as useStyledTheme } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../App';
import axylonLogoDark from '../../assets/icons/axylon-logo-dark.svg';
import axylonLogoLight from '../../assets/icons/axylon-logo-light.svg';
import themeToggleDark from '../../assets/icons/theme-toggle-dark.svg';
import themeToggleLight from '../../assets/icons/theme-toggle-light.svg';

const HeaderContainer = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.headerBg};
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  padding: 20px 0;
  @media (max-width: 1024px) {
    padding: 16px 0;
  }
  @media (max-width: 768px) {
    padding: 16px 0;
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

const LogoBlock = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  height: 36px;
  @media (max-width: 767px) {
    height: 28px;
  }
`;

const LogoImg = styled.img`
  height: 36px;
  width: auto;
  @media (max-width: 767px) {
    height: 28px;
  }
`;

const Menu = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
  @media (max-width: 767px) {
    display: none;
  }
`;

const MenuButton = styled(Link)<{$active?: boolean; $multiline?: boolean}>`
  color: ${({$active, theme}) => ($active ? theme.textAccent : theme.textSecondary)};
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3em;
  text-align: center;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s, transform 0.2s;
  white-space: ${({$multiline}) => $multiline ? 'pre-line' : 'nowrap'};
  &:hover {
    color: ${({theme}) => theme.textAccent};
    background: none;
    transform: scale(1.04);
    line-height: 1.3em;
  }
`;

const ThemeToggle = styled.button<{$themeType: 'dark' | 'light'}>`
  width: 70px;
  height: 36px;
  border: none;
  border-radius: 30px;
  background: ${({ $themeType }) =>
    $themeType === 'dark'
      ? `url(${themeToggleDark}) center/cover no-repeat`
      : `url(${themeToggleLight}) center/cover no-repeat`};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(201,24,74,0.10);
  padding: 0;
  &:hover {
    filter: brightness(0.95);
    box-shadow: 0 4px 16px rgba(201,24,74,0.18);
  }
  @media (max-width: 767px) {
    height: 28px;
    width: 54px;
  }
`;

const BurgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  box-sizing: content-box;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  @media (max-width: 767px) {
    display: flex;
  }
`;

const BurgerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="6" width="28" height="2.5" rx="1.25" fill="#C9184A"/>
    <rect y="13" width="28" height="2.5" rx="1.25" fill="#C9184A"/>
    <rect y="20" width="28" height="2.5" rx="1.25" fill="#C9184A"/>
  </svg>
);

interface MobileMenuOverlayProps {
  open: boolean;
}

const MobileMenuOverlay = styled.div<MobileMenuOverlayProps>`
  display: none;
  @media (max-width: 767px) {
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 200;
  }
`;

const MobileMenu = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    width: 220px;
    height: 100vh;
    background: ${({ theme }) => theme.headerBg};
    box-shadow: -2px 0 12px rgba(0,0,0,0.08);
    z-index: 300;
    padding: 32px 16px 16px 16px;
    gap: 16px;
    animation: slideIn 0.2s;
    @keyframes slideIn {
      from { right: -240px; opacity: 0; }
      to { right: 0; opacity: 1; }
    }
  }
`;

const MobileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

// Хук для отслеживания ширины окна
function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const logoSrc = theme === 'dark' ? axylonLogoDark : axylonLogoLight;
  return (
    <HeaderContainer>
      <Content>
        <LogoBlock as="div">
          <LogoImg src={logoSrc} alt="AXYLON logo" />
        </LogoBlock>
        <ThemeToggle title="Toggle theme" onClick={toggleTheme} $themeType={theme as 'dark' | 'light'} aria-label="Переключить тему" />
      </Content>
    </HeaderContainer>
  );
};

export default Header; 