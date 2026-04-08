import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import api from '../services/api';

export const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('admin-login/', formData);
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      window.location.href = '/admin-dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials or access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>

      <div className="z-10 bg-card p-10 rounded-3xl border border-primary/30 w-full max-w-md shadow-2xl relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
          <Shield className="w-6 h-6 text-black" />
        </div>

        <h2 className="text-3xl font-black mt-4 mb-2 text-center text-primary tracking-widest uppercase">Admin Access</h2>
        <p className="text-muted-foreground text-center text-xs mb-8">Authorized personnel only.</p>

        {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-6 border border-destructive/20 font-bold">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Admin ID</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground font-medium"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Passkey</label>
            <input
              type="password"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground font-medium"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 mt-4 group flex items-center justify-center gap-2">
            Authenticate <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
