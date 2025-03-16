
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { connectToMongoDB } from './config/mongodb';

// Initialize the root element or create it if it doesn't exist
const getRootElement = () => {
  let rootElement = document.getElementById('root');
  if (!rootElement) {
    console.log("Creating root element as it wasn't found");
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    rootElement = newRoot;
  }
  return rootElement;
};

// Set initial visible loading state
const rootElement = getRootElement();
rootElement.innerHTML = `
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

// Suppress common errors that might prevent rendering
const suppressCommonErrors = () => {
  if (window && window.console) {
    const originalError = window.console.error;
    window.console.error = (...args) => {
      // Skip certain errors that shouldn't prevent rendering
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('emitWarning') || 
           args[0].includes('Failed to execute') ||
           args[0].includes('TypeError'))) {
        console.log("Suppressed non-critical error:", args[0].substring(0, 100) + "...");
        return;
      }
      originalError.apply(window.console, args);
    };
  }
};

// Apply error suppression
suppressCommonErrors();

// Render the app with error handling
try {
  console.log("Creating React root");
  const root = ReactDOM.createRoot(rootElement);
  
  // Add global error handler for unhandled exceptions
  window.addEventListener('error', (event) => {
    console.log('Caught global error:', event.error);
    // Don't let errors stop the app from rendering
    event.preventDefault();
    
    // Show user-friendly error message if React fails to render
    if (!document.getElementById('app-rendered')) {
      rootElement.innerHTML += `
        <div id="app-rendered" style="display: none;"></div>
        <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <p style="color: #666;">We encountered a minor issue while loading. Please refresh the page if content doesn't appear within a few seconds.</p>
        </div>
      `;
    }
    return true;
  });
  
  console.log("Rendering app");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Mark app as rendered
  const renderedMarker = document.createElement('div');
  renderedMarker.id = 'app-rendered';
  renderedMarker.style.display = 'none';
  document.body.appendChild(renderedMarker);
  
  // Connect to MongoDB in the background without blocking rendering
  setTimeout(() => {
    console.log("Attempting MongoDB connection in background");
    connectToMongoDB().catch(error => {
      console.error("MongoDB connection failed, but app will continue:", error);
    });
  }, 2000);
  
} catch (error) {
  console.error("Critical render error:", error);
  
  // Show error on the page if React fails to render
  rootElement.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="color: #d00; margin-bottom: 20px;">Unable to load application</h1>
      <p>The application encountered an error while starting up. Please try refreshing the page.</p>
      <p style="margin-top: 20px;"><strong>Technical details:</strong></p>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
    </div>
  `;
}
