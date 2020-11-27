import { useState, useLayoutEffect, useEffect } from 'react';
import { styled } from 'goober';

const moon = {
  viewBox: '0 0 512 512',
  d: 'M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 00283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z',
};

const sun = {
  viewBox: '0 0 45.16 45.16',
  d: 'M22.58 11.269c-6.237 0-11.311 5.075-11.311 11.312s5.074 11.312 11.311 11.312c6.236 0 11.311-5.074 11.311-11.312S28.816 11.269 22.58 11.269zM22.58 7.944a2.207 2.207 0 01-2.207-2.206V2.207a2.207 2.207 0 114.414 0v3.531a2.207 2.207 0 01-2.207 2.206zM22.58 37.215a2.207 2.207 0 00-2.207 2.207v3.53a2.207 2.207 0 104.414 0v-3.53a2.208 2.208 0 00-2.207-2.207zM32.928 12.231a2.208 2.208 0 010-3.121l2.497-2.497a2.207 2.207 0 113.121 3.121l-2.497 2.497a2.207 2.207 0 01-3.121 0zM12.231 32.93a2.205 2.205 0 00-3.121 0l-2.497 2.496a2.207 2.207 0 003.121 3.121l2.497-2.498a2.204 2.204 0 000-3.119zM37.215 22.58c0-1.219.988-2.207 2.207-2.207h3.531a2.207 2.207 0 110 4.413h-3.531a2.206 2.206 0 01-2.207-2.206zM7.944 22.58a2.207 2.207 0 00-2.207-2.207h-3.53a2.207 2.207 0 100 4.413h3.531a2.206 2.206 0 002.206-2.206zM32.928 32.93a2.208 2.208 0 013.121 0l2.497 2.497a2.205 2.205 0 11-3.121 3.12l-2.497-2.497a2.205 2.205 0 010-3.12zM12.231 12.231a2.207 2.207 0 000-3.121L9.734 6.614a2.207 2.207 0 00-3.121 3.12l2.497 2.497a2.205 2.205 0 003.121 0z',
};

const Toggle = styled(({ theme, children, ...rest }) => {
  if (!theme) return null;

  const icon = theme === 'dark' ? moon : sun;

  return (
    <button
      {...rest}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      tabIndex={0}
    >
      <svg viewBox={icon.viewBox} aria-hidden="true">
        <path fill="currentColor" d={icon.d} />
      </svg>
      {children}
    </button>
  )
})`
  display: inline-block;
  position: absolute;
  appearance: none;
  background: none;
  border: none;
  outline: none;
  color: inherit;
  cursor: pointer;

  padding: 1em;
  margin: -1em;
  margin-left: 1ch;

  & > svg {
    width: 1.1rem;
    height: 1.1rem;
  }
`;

const ThemeToggle = () => {
  const [theme, setTheme] = useState(null);

  useLayoutEffect(() => {
    const preference = localStorage.getItem('prefers-theme');
    if (preference === 'dark' || preference === 'light') {
      setTheme(preference);
    } else {
      const match = window.matchMedia('screen and (prefers-color-scheme: dark)');
      setTheme(match && match.matches ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('prefers-theme', newTheme);
      return newTheme;
    });
  };

  return (
    <Toggle
      theme={theme}
      onClick={toggleTheme}
    />
  );
};

export default ThemeToggle;
