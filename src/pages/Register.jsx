import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('register/', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username may already exist.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-card p-8 rounded-2xl border border-border w-full max-w-md shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};
