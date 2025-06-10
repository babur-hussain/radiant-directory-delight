import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loading...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('Creating React root...');

const root = ReactDOM.createRoot(rootElement);

console.log('Rendering App...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
