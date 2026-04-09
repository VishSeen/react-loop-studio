import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for "Script error." and other early failures
window.onerror = function(message) {
  if (message === "Script error.") {
    console.warn("Script error detected in main.tsx. This is usually a CORS issue.");
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
