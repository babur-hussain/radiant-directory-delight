
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
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error("Root element not found in the DOM");
      // Create root element if missing
      const newRoot = document.createElement('div');
      newRoot.id = 'root';
      document.body.appendChild(newRoot);
      console.log("Created new root element");
      
      // Render a simple loading message first to ensure something is visible
      const tempRoot = ReactDOM.createRoot(newRoot);
      tempRoot.render(<div className="flex min-h-screen items-center justify-center">Loading application...</div>);
      
      // Then render the actual app
      setTimeout(() => {
        tempRoot.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      }, 10);
    } else {
      // Render a simple loading message first to ensure something is visible
      const root = ReactDOM.createRoot(rootElement);
      root.render(<div className="flex min-h-screen items-center justify-center">Loading application...</div>);
      
      // Then render the actual app
      setTimeout(() => {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      }, 10);
    }
    
    console.log("React app rendering initiated");
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

// Make sure we render the app as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  // The document has already been loaded, render immediately
  renderApp();
}

// Try to connect to MongoDB in the background with a very short timeout
if (typeof window !== 'undefined') {
  // Don't wait for MongoDB connection to render the app
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
  }, 50); // Very short delay to prioritize rendering the UI first
}
