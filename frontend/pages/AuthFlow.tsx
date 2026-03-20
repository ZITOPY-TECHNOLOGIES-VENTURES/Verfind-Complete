import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { LoadingWave } from '../components/LoadingWave';

const AuthFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Determine which view to show based on the path
  const isRegister = location.pathname === '/register';
  const isForgot   = location.pathname === '/forgot-password';

  useEffect(() => {
    // Artificial delay to allow LiquidBackground to initialize and feel smooth
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: 'transparent' }}>
        <LoadingWave text="Loading secure interface..." />
      </div>
    );
  }

  if (isRegister) return <Register />;
  
  // Basic Forgot Password placeholder since we don't have a specific file yet
  if (isForgot) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6" style={{ background: 'transparent' }}>
        <div className="glass-card p-xl max-w-[400px] text-center space-y-md">
           <h2 className="text-h2 font-bold text-secondary">Forgot Password</h2>
           <p className="text-text-secondary">Please contact support or check back later for the automated reset flow.</p>
           <button 
             onClick={() => navigate('/login')}
             className="w-full bg-accent text-white font-bold py-sm rounded"
           >
             Back to Login
           </button>
        </div>
      </div>
    );
  }

  return <Login />;
};

export default AuthFlow;
