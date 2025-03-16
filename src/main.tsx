
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Initialize MongoDB connection - only in browser environment
// But don't block rendering the app if connection fails
if (typeof window !== 'undefined') {
  connectToMongoDB()
    .then(success => {
      console.log('MongoDB initialization result:', success);
    })
    .catch(error => {
      console.error('Error during MongoDB initialization:', error);
      console.log('Continuing to render app despite MongoDB connection failure');
    });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
