import { useEffect, useState } from 'react';
import { AntreanPage } from './pages/AntreanPage';
import { OperatorPage } from './pages/OperatorPage';
import { TVPage } from './pages/TVPage';
import { PublicPage } from './pages/PublicPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffPage } from './pages/StaffPage';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from './hooks/useAuth';


function getRoute(): string {
  return window.location.hash.replace('#', '') || '/dashboard';
}

function DashboardWrapper({ route }: { route: string }) {
  let content = <DashboardPage />;

  if (route === '/antrean') {
    content = <AntreanPage />;
  } else if (route === '/history') {
    content = <HistoryPage />;
  } else if (route === '/staff') {
    content = <StaffPage />;
  } else if (route === '/settings') {
    content = <SettingsPage />;
  } else if (route === '/operator') {
    content = <OperatorPage />;
  }

  return (
    <DashboardLayout route={route}>
      {content}
    </DashboardLayout>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-600 to-orange-800 gap-4">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">Memuat...</p>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const handle = () => setRoute(getRoute());
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);

  // Tunggu auth state selesai di-load
  if (loading) return <LoadingScreen />;

  // Standalone pages (TV & publik tidak memerlukan auth)
  if (route === '/tv') return <TVPage />;
  if (route === '/public') return <PublicPage />;
  if (route === '/login') return <LoginPage />;
  if (route === '/register') return <RegisterPage />;

  // Auth guard: redirect ke login jika belum authenticated
  if (!isAuthenticated) {
    window.location.hash = '#/login';
    return <LoadingScreen />;
  }

  // Admin layout pages
  return <DashboardWrapper route={route} />;
}

export default App;
