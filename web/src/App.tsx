import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  type Theme,
} from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { Toast } from './components/common/Toast';
import { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState<Theme>(webLightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    setTheme(prefersDark ? webDarkTheme : webLightTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      setTheme(e.matches ? webDarkTheme : webLightTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    setTheme(isDark ? webLightTheme : webDarkTheme);
  };

  return (
    <FluentProvider theme={theme}>
      <BrowserRouter>
        <AppRouter toggleTheme={toggleTheme} isDark={isDark} />
        <Toast />
      </BrowserRouter>
    </FluentProvider>
  );
}

export default App;
