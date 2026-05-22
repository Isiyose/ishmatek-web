/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
} from 'lucide-react';
import { TabType, DashboardState } from './types';
import Overview from './components/Overview';
import Configuration from './components/Configuration';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Admin from './components/Admin';
import FloorMap from './components/FloorMap';
import Registry from './components/Registry';
import Monitor from './components/Monitor';
import Data from './components/Data';
import Security from './components/Security';
import Integrations from './components/Integrations';
import Login from './components/Login';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { useSettings } from './contexts/SettingsContext';
import { useTranslation } from './lib/i18n';

export default function App() {
  const { language } = useSettings();
  const t = useTranslation(language);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const [state, setState] = useState<DashboardState>({
    water: { value: 52.4, history: [], drift: 0, min: 20, max: 80, unit: 'L/min' },
    temp:  { value: 23.7, history: [], drift: 0, min: 15, max: 35, unit: '°C' },
    air:   { value: 712,  history: [], drift: 0, min: 400, max: 1200, unit: 'ppm' },
    power: { value: 318,  history: [], drift: 0, min: 100, max: 450, unit: 'kW' },
  });

  const handleLogin = (u: string, p: string, coords?: { lat: number, lng: number }) => {
    if (u && p) {
      const savedUsers = localStorage.getItem('nexus_admin_users');
      if (savedUsers) {
        const adminUsers = JSON.parse(savedUsers);
        const matched = adminUsers.find(
          (user: any) =>
            (user.email === u || user.username === u) &&
            user.password === p &&
            user.status === 'Active'
        );
        if (matched) {
          const userData = {
            name: matched.name,
            role: matched.role,
            lat: coords?.lat,
            lng: coords?.lng,
            lastSeen: 'Active now',
            status: 'online'
          };
          setUser(userData);
          setIsLoggedIn(true);
          localStorage.setItem('nexus_user', JSON.stringify(userData));
          return true;
        }
      }
      return false;
    }
    return false;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics');
        if (res.ok) {
          const apiMetrics = await res.json();
          setState(prev => {
            const next = { ...prev };
            (Object.keys(next) as Array<keyof DashboardState>).forEach(key => {
              if (apiMetrics[key]) {
                next[key].value = apiMetrics[key].value;
                next[key].history = [...next[key].history, apiMetrics[key].value].slice(-50);
              }
            });
            return { ...next };
          });
        }
      } catch (err) {
        // API offline, apply standard state simulation locally
        setState(prev => {
          const next = { ...prev };
          (Object.keys(next) as Array<keyof DashboardState>).forEach(key => {
            const s = next[key];
            s.drift += (Math.random() - 0.47) * (key === 'water' ? 1.8 : key === 'temp' ? 0.2 : key === 'air' ? 14 : 5);
            s.drift *= 0.88;
            s.value = Math.max(s.min * 0.8, Math.min(s.max * 1.1, s.value + s.drift));
            s.history = [...s.history, s.value].slice(-50);
          });
          return { ...next };
        });
      }
    };

    // Trigger immediate fetch & start interval
    fetchMetrics();
    const dataInterval = setInterval(fetchMetrics, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(dataInterval);
    };
  }, []);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const timeStr = useMemo(() => time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), [time]);

  if (!isLoggedIn) {
    return (
      <ErrorBoundary>
        <Login onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        timeStr={timeStr}
        user={user}
        onLogout={handleLogout}
      >
        <TabRenderer activeTab={activeTab} state={state} user={user} />
      </Layout>
    </ErrorBoundary>
  );
}

function TabRenderer({ activeTab, state, user }: { activeTab: TabType, state: DashboardState, user: any }) {
  const { language } = useSettings();
  const t = useTranslation(language);

  switch (activeTab) {
    case 'overview': return <Overview state={state} />;
    case 'monitor': return <Monitor />;
    case 'configuration': return <Configuration />;
    case 'floormap': 
    case 'floormap-devices':
    case 'floormap-layout':
      return <FloorMap user={user} initialView={
        activeTab === 'floormap-layout' ? 'layout' : 
        'devices'
      } />;
    case 'explorer': return <Data />;
    case 'registry': 
    case 'registry-inventory':
    case 'registry-definition':
      return <Registry user={user} initialView={
        activeTab === 'registry-definition' ? 'definition' : 
        'inventory'
      } />;
    case 'alerts': return <Alerts />;
    case 'integrations': return <Integrations />;
    case 'security': return <Security />;
    case 'settings': return <Settings />;
    case 'admin': return <Admin />;
    default: 
      return (
        <div className="flex flex-col items-center justify-center gap-3 h-full text-text-muted">
          <Database size={48} className="opacity-30" />
          <h2 className="text-base font-semibold text-text-dim capitalize prose-none">{t(activeTab)}</h2>
          <p className="text-xs text-center max-w-[320px] leading-relaxed">
            Module under construction. Real-time data feed and historical analysis will be available here shortly.
          </p>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-nexus-blue/10 text-nexus-blue border border-nexus-blue/20">
            Coming next
          </span>
        </div>
      );
  }
}

