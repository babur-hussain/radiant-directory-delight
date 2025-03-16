
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Create a function to handle the app rendering with proper error fallbacks
function renderApp() {
  // Only render if the app hasn't been rendered yet
  if (!window.appRendered) {
    window.appRendered = true;
    
    try {
      console.log("Rendering React app to DOM");
      const rootElement = document.getElementById('root');
      
      if (!rootElement) {
        console.error("Root element not found in the DOM");
        // Try to create root element if missing
        const newRoot = document.createElement('div');
        newRoot.id = 'root';
        document.body.appendChild(newRoot);
        console.log("Created new root element");
        
        ReactDOM.createRoot(newRoot).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      } else {
        ReactDOM.createRoot(rootElement).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      }
      
      console.log("React app rendered successfully");
    } catch (error) {
      console.error("Error rendering React app:", error);
      // Ensure visible error message if React fails to render
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h1>Something went wrong</h1>
          <p>Please try refreshing the page.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Add a failsafe to ensure rendering happens
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Try to connect to MongoDB in the background (reduced priority)
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
