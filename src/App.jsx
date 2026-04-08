import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { MarketingLayout } from './components/marketing/MarketingLayout';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { HistoryPage } from './pages/History';
import { SubscriptionPage } from './pages/Subscription';
import { SettingsPage } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';
import { Journal } from './pages/Journal';
import AdminDashboard from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppLayoutWrapper = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const MarketingLayoutWrapper = () => (
  <MarketingLayout>
    <Outlet />
  </MarketingLayout>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* App Routes */}
          <Route element={<AppLayoutWrapper />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Marketing Routes */}
          <Route element={<MarketingLayoutWrapper />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin Login - standalone */}
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
