import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Dashboard from './components/Dashboard/Dashboard';
import { lightTheme, darkTheme } from './constants/theme';
import styled from 'styled-components';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});
export const useTheme = () => useContext(ThemeContext);

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding: 0 20px;
  padding-top: 76px;
  @media (max-width: 1024px) {
    padding-top: 69px;
  }
  @media (max-width: 767px) {
    padding-top: 60px;
  }
`;

// Удаляю MainPage компонент

const BlurryCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const move = (e: MouseEvent) => {
        setPos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', move);
      return () => window.removeEventListener('mousemove', move);
    } catch (error) {
      console.warn('BlurryCursor error:', error);
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - 30,
        top: pos.y - 30,
        width: 60,
        height: 60,
        pointerEvents: 'none',
        borderRadius: '50%',
        background: '#C9184A',
        filter: 'blur(20px)',
        opacity: 0.25,
        zIndex: 9999,
        mixBlendMode: 'normal',
      }}
    />
  );
};

// Хук для проверки ширины экрана
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } catch (error) {
      console.warn('useMediaQuery error:', error);
    }
  }, [matches, query]);
  return matches;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
        {isDesktop && <BlurryCursor />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
