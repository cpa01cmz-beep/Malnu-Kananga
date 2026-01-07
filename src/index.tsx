
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logger } from './utils/logger';
import './style.css';
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
    if (confirm('Konten baru tersedia. Refresh sekarang?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    logger.info('Aplikasi siap untuk penggunaan offline.');
  },
});

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
