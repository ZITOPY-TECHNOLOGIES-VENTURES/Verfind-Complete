import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AuthFlow from './pages/AuthFlow';
import Home from './pages/Home';
import LiquidBackground from './components/LiquidBackground';

// Import Info Pages
import { 
  RentPage, BuyPage, SellPage, VerifyPage, 
  AboutPage, HowPage, ContactPage, HelpPage 
} from './pages/InfoPages';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <LiquidBackground />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Info Pages Routes */}
            <Route path="/rent" element={<RentPage />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how" element={<HowPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* New centralized auth router */}
            <Route path="/login" element={<AuthFlow />} />
            <Route path="/register" element={<AuthFlow />} />
            <Route path="/forgot-password" element={<AuthFlow />} />
            <Route path="/reset-password" element={<AuthFlow />} />

            {/* Maintenance / placeholders */}
            <Route path="/pricing" element={<div className="p-20 text-white font-black text-center">PRICING PAGE - COMING SOON</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;