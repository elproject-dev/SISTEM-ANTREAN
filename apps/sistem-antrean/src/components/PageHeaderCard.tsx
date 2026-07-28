import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@elproject/ui';
import { LogOut, User, Settings, CheckCircle2 } from 'lucide-react';

interface PageHeaderCardProps {
  title: ReactNode;
  subtitle: string;
  children?: ReactNode;
  showProfile?: boolean;
}

export function PageHeaderCard({ title, subtitle, children, showProfile = true }: PageHeaderCardProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/70 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white/50 w-full mb-6 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 drop-shadow-sm flex items-center gap-3">
          {title}
        </h1>
        <p className="text-slate-800 mt-0.5 text-xs sm:text-sm font-medium drop-shadow-sm">
          {subtitle}
        </p>
      </div>
      <div className="shrink-0 flex items-center justify-between md:justify-end w-full md:w-auto gap-3 sm:gap-4">
        {children}
                {showProfile && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative inline-flex items-center justify-center shrink-0 border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full transition-transform hover:scale-105 ml-auto md:ml-0"
                title="Profil Admin"
              >
                <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md border-2 overflow-hidden bg-white ${isOnline ? 'border-emerald-500' : 'border-red-500'}`}>
                  <img src={`${import.meta.env.BASE_URL}check.png`} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </button>
            </PopoverTrigger>
            
            <PopoverContent className="w-72 p-0 rounded-2xl shadow-2xl border-slate-200 bg-white" align="end" sideOffset={12}>
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-orange-200 shrink-0">
                    A
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                      Administrator <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">elproject.dev@gmail.com</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors font-semibold">
                  <User size={16} /> Edit Profil
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors font-semibold">
                  <Settings size={16} /> Pengaturan Akun
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <button 
                  onClick={() => { window.location.hash = "#/login"; }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
                >
                  <LogOut size={16} /> Keluar (Logout)
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
