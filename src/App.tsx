
import React from 'react';
import { Toaster } from 'sonner';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { PopupAdProvider } from './providers/PopupAdProvider';
import './App.css';

// Import autopay service to start it
import './services/autopayService';

function App() {
  return (
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
  );
}

export default App;
