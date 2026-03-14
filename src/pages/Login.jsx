import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('login/', formData);
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-card p-8 rounded-2xl border border-border w-full max-w-md shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary py-3 rounded-xl font-bold text-primary-foreground hover:bg-primary/90 transition-all">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
};
