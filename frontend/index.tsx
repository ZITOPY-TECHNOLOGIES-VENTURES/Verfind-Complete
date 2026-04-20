import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

// Faster removal logic
const removePreloader = () => {
  const preloader = document.getElementById('verifind-preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    setTimeout(() => preloader.remove(), 400);
    document.body.style.overflow = 'auto';
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical: Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

// Render and immediately schedule preloader removal
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// We don't wait for 'load' anymore, we use requestAnimationFrame 
// which fires after the first browser paint of the React app
requestAnimationFrame(() => {
  // Slight delay to ensure React has actually painted the layout
  setTimeout(removePreloader, 100);
});

window.addEventListener('error', (event) => {
  console.error('Verifind Runtime Error:', event.error);
});