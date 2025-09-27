import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx'; // Ensure the import matches the file name exactly
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Global styles (could be for fonts, background, etc.)
import './App.css'; // App-specific styles (for the chat UI and messages)
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
