
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logger } from './utils/logger';
import './index.css';
import './styles/themes.css';
// Import registration function
import { registerSW } from 'virtual:pwa-register';
// Import storage migration
import { runStorageMigration } from './services/storageMigration';

// Run storage migration before initialization
runStorageMigration();

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  },
  onOfflineReady() {
    logger.info('Aplikasi siap untuk penggunaan offline.');
  },
});

(window as typeof window & { updatePWA?: () => void }).updatePWA = () => updateSW(true);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
