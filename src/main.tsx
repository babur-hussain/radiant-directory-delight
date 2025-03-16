
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Initialize MongoDB connection - only in browser environment
// But don't block rendering the app if connection fails
if (typeof window !== 'undefined') {
  // Set a timeout to ensure the app renders even if MongoDB connection hangs
  const connectionTimeout = setTimeout(() => {
    console.log('MongoDB connection timeout reached, continuing app initialization');
    renderApp();
  }, 5000); // 5 second timeout

  connectToMongoDB()
    .then(success => {
      clearTimeout(connectionTimeout);
      console.log('MongoDB initialization result:', success);
      renderApp();
    })
    .catch(error => {
      clearTimeout(connectionTimeout);
      console.error('Error during MongoDB initialization:', error);
      console.log('Continuing to render app despite MongoDB connection failure');
      renderApp();
    });
} else {
  renderApp();
}

function renderApp() {
  // Only render if the app hasn't been rendered yet
  if (!window.appRendered) {
    window.appRendered = true;
    
    try {
      console.log("Rendering React app to DOM");
      ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
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
          </div>
        `;
      }
    }
  }
}

// For TypeScript
declare global {
  interface Window {
    appRendered?: boolean;
  }
}
