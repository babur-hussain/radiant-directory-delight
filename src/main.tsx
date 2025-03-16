
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

console.log("Starting application in main.tsx");

// Create a function to handle the app rendering with proper error fallbacks
function renderApp() {
  try {
    console.log("Rendering React app to DOM");
    
    // Get root element or create one if it doesn't exist
    let rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error("Root element not found in the DOM");
      // Create root element if missing
      const newRoot = document.createElement('div');
      newRoot.id = 'root';
      document.body.appendChild(newRoot);
      console.log("Created new root element");
      rootElement = newRoot;
    }
    
    // Always show something to the user immediately
    const tempHtml = `
      <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; font-family: system-ui, sans-serif;">
        <div style="text-align: center;">
          <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Loading Grow Bharat Vyapaar...</h1>
          <div style="display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(102, 16, 242, 0.2); border-radius: 50%; border-top-color: rgba(102, 16, 242, 1); animation: spin 1s linear infinite;"></div>
        </div>
      </div>
      <style>
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      </style>
    `;
    rootElement.innerHTML = tempHtml;
    
    // Then render the actual app with a minimal delay
    // This ensures the loading indicator is visible to the user
    setTimeout(() => {
      try {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        console.log("React app rendering initiated");
      } catch (renderError) {
        console.error("Error during React rendering:", renderError);
        // Show error message if React fails to render
        rootElement.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <h1>Something went wrong</h1>
            <p>Please try refreshing the page.</p>
            <p>Error: ${renderError instanceof Error ? renderError.message : 'Unknown error'}</p>
          </div>
        `;
      }
    }, 10);
    
  } catch (error) {
    console.error("Critical error rendering app:", error);
    // Ensure visible error message if everything fails
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Critical Error</h1>
        <p>The application could not start properly.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
}

// Render the app immediately, regardless of document readiness
renderApp();

// Try to connect to MongoDB in the background with a short timeout
// This is handled separately and won't block rendering
if (typeof window !== 'undefined') {
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
  }, 100);
}
