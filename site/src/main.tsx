import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { detectLang, loadLang } from './i18n';
import './index.css';

// The visitor's language loads first: the app's modules translate their copy as they import.
await loadLang(detectLang());
const { default: App } = await import('./App');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
