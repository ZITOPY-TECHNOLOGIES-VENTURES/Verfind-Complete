
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Login failed');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-sm">
      <div className="w-full max-w-[400px] glass-card p-lg space-y-md">
        <div className="text-center">
          <Logo className="justify-center mb-6" size={64} />
          <h1 className="text-h2 font-bold text-secondary">Welcome Back</h1>
          <p className="text-text-secondary text-small">Login to access verified Abuja properties</p>
        </div>

        {error && <div className="p-sm bg-red-50 text-red-600 rounded text-small font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-sm">
          <div className="space-y-xs">
            <label htmlFor="email" className="block text-small font-semibold text-secondary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-text-secondary" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-xl pr-sm py-sm border border-border rounded focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label htmlFor="password" title="Password" className="block text-small font-semibold text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-xl pr-sm py-sm border border-border rounded focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-sm rounded transition-all flex items-center justify-center gap-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="text-center text-small text-text-secondary">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
