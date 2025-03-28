
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create and get root element to ensure we have a place to render
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

// Display immediate feedback to user
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

// Render with simplified error handling
try {
  console.log("Creating React root");
  const root = ReactDOM.createRoot(rootElement);
  
  // Global error handler to catch rendering errors
  window.addEventListener('error', (event) => {
    console.error('Caught error:', event.error);
    return true; // Prevent default handling
  });
  
  // Render the app
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
} catch (error) {
  console.error("Critical render error:", error);
  
  // Ensure user sees something
  rootElement.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="color: #d00; margin-bottom: 20px;">Application Error</h1>
      <p>The application encountered an error. Please try refreshing the page.</p>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin-top: 10px; color: #666;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
    </div>
  `;
}
