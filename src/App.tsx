
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import './App.css';

// Import autopay service to start it
import './services/autopayService';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PopupAdProvider>
          <div className="App">
            <AppRoutes />
            <Toaster 
              position="top-right"
              richColors
              closeButton
            />
          </div>
        </PopupAdProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
