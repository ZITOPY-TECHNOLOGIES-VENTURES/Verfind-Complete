
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader2, Home, Briefcase } from 'lucide-react';
import { Logo } from '../components/Logo';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'tenant' as 'tenant' | 'agent'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(formData.username, formData.email, formData.password, formData.role);
    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Registration failed');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-sm">
      <div className="w-full max-w-[440px] glass-card p-lg space-y-md">
        <div className="text-center">
          <Logo className="justify-center mb-4" size={56} />
          <h1 className="text-h2 font-bold text-secondary">Join Verifind</h1>
          <p className="text-text-secondary text-small">Start browsing verified Abuja properties today</p>
        </div>

        <div className="grid grid-cols-2 gap-sm p-xs bg-bg-app rounded">
          <button 
            onClick={() => setFormData({...formData, role: 'tenant'})}
            className={`flex items-center justify-center gap-xs py-xs rounded text-small font-bold transition-all ${formData.role === 'tenant' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
          >
            <Home size={16} /> Tenant
          </button>
          <button 
            onClick={() => setFormData({...formData, role: 'agent'})}
            className={`flex items-center justify-center gap-xs py-xs rounded text-small font-bold transition-all ${formData.role === 'agent' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
          >
            <Briefcase size={16} /> Agent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-sm">
          <div className="space-y-xs">
            <label htmlFor="username" className="block text-small font-semibold text-secondary">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-text-secondary" size={18} />
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-xl pr-sm py-sm border border-border rounded"
              />
            </div>
          </div>

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
                placeholder="john@example.com"
                className="w-full pl-xl pr-sm py-sm border border-border rounded"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label htmlFor="password" title="Password" className="block text-small font-semibold text-secondary">Create Password</label>
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
                className="w-full pl-xl pr-sm py-sm border border-border rounded"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent hover:bg-orange-700 text-white font-bold py-sm rounded transition-all flex items-center justify-center gap-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="text-center text-small text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
