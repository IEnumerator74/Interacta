import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Auth, { ProtectedRoute } from './components/Auth';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);