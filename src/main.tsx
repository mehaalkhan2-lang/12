import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("X LUXE App Crash Recovery:", error);
  document.body.innerHTML = `<div style="padding: 20px; color: gold; background: black; font-family: sans-serif;">
    <h1 style="font-size: 1.5rem;">System Recalibration Required</h1>
    <p>The clinical interface encountered a startup error. Please check the browser console and verified your environment variables.</p>
  </div>`;
}
