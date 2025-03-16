
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Create a function to handle the app rendering
function renderApp() {
  // Only render if the app hasn't been rendered yet
  if (!window.appRendered) {
    window.appRendered = true;
    
    try {
      console.log("Rendering React app to DOM");
      const rootElement = document.getElementById('root');
      
      if (!rootElement) {
        console.error("Root element not found in the DOM");
        return;
      }
      
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (error) {
      console.error("Error rendering React app:", error);
      // Display a basic error message if React fails to render
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h1>Something went wrong</h1>
            <p>Please try refreshing the page.</p>
            <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        `;
      }
    }
  }
}

// Immediately render the app - don't wait for MongoDB
renderApp();

// Try to connect to MongoDB in the background
if (typeof window !== 'undefined') {
  // Set a timeout to ensure we don't block rendering if MongoDB connection hangs
  setTimeout(() => {
    console.log("Initializing MongoDB connection in the background");
    connectToMongoDB()
      .then(success => {
        console.log('MongoDB initialization result:', success);
      })
      .catch(error => {
        console.error('Error during MongoDB initialization:', error);
        console.log('App will continue to function with static data');
      });
  }, 100); // Short delay to prioritize rendering the UI first
}

// For TypeScript
declare global {
  interface Window {
    appRendered?: boolean;
  }
}
