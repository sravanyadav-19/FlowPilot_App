import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found. Check public/index.html');
}

const root = createRoot(container);
root.render(<App />);
