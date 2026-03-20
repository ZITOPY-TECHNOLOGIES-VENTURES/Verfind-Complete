import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import AuthFlow  from './pages/AuthFlow.tsx';
import Dashboard from './pages/Dashboard.tsx';
import LiquidBackground from './components/LiquidBackground.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <LiquidBackground />
          <Routes>
            <Route path="/login"            element={<AuthFlow />} />
            <Route path="/register"         element={<AuthFlow />} />
            <Route path="/forgot-password"  element={<AuthFlow />} />
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/"                 element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;