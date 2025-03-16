
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Initialize MongoDB connection - only in browser environment
if (typeof window !== 'undefined') {
  connectToMongoDB()
    .then(success => {
      console.log('MongoDB initialization result:', success);
    })
    .catch(error => {
      console.error('Error during MongoDB initialization:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
