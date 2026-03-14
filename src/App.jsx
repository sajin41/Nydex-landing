import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  const [isAppRoute, setIsAppRoute] = useState(false);

  useEffect(() => {
    // Determine whether to serve AI Platform or Marketing Site based on URL
    const hostname = window.location.hostname;
    if (hostname.startsWith('ai.') || window.location.pathname.startsWith('/app')) {
      setIsAppRoute(true);
    } else {
      // By default locally or on nydex.in, serve marketing site
      setIsAppRoute(false);
    }
  }, []);

  if (!isAppRoute) {
    return (
      <ThemeProvider>
        <Router>
          <MarketingLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              {/* Optional fallback, allow navigation to app pages directly from marketing domain during dev */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </MarketingLayout>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
