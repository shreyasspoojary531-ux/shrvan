import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import MobileApp from './pages/Mobile/MobileApp.jsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (currentPath === '/mobile') {
    return <MobileApp onBackToDashboard={() => navigateTo('/')} />;
  }

  return <Dashboard onNavigateMobile={() => navigateTo('/mobile')} />;
}
