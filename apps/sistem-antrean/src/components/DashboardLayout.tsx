
import {
  LayoutDashboard,
  Radio,
  Monitor,
  Tv2,
  Globe,
  History,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@elproject/ui';
import { useQueue } from '../hooks/useQueue';
import { BottomNavigation } from './BottomNavigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@elproject/ui';

// ─── Nav Config ───────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  hash: string;
  badge?: number;
  group?: string;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hash: '#/dashboard', group: 'main' },
  { id: 'admin', label: 'Antrean', icon: Radio, hash: '#/antrean', group: 'main' },
  { id: 'operator', label: 'Panel Operator', icon: Monitor, hash: '#/operator', group: 'main' },
];

const EXTRA_ITEMS: NavItem[] = [
  { id: 'history', label: 'Riwayat', icon: History, hash: '#/history', group: 'extra' },
  { id: 'staff', label: 'Staff', icon: Users, hash: '#/staff', group: 'extra' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, hash: '#/settings', group: 'extra' },
];

const QUICK_LINKS: NavItem[] = [
  { id: 'tv', label: 'TV Display', icon: Tv2, hash: '#/tv', group: 'quick', external: true },
  { id: 'public', label: 'Web Publik', icon: Globe, hash: '#/public', group: 'quick', external: true },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  route: string;
  children: React.ReactNode;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardLayout({ route, children }: DashboardLayoutProps) {
  const { waitingTickets } = useQueue();
  const waitingCount = waitingTickets.length;
  const isActive = (hash: string) => {
    if (hash === '#/dashboard' && (route === '/dashboard' || route === '/')) return true;
    return route === hash.replace('#', '');
  };



  return (
    <div 
      className="flex min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}bg_tv.png')` }}
    >
      <TooltipProvider delayDuration={0}>
        {/* ── Desktop Sidebar (Icons Only) ── */}
        <aside className="w-16 bg-transparent text-slate-800 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 fixed top-0 left-0 h-screen z-40">
          
          <div className="h-16 flex items-center justify-center flex-shrink-0">
            <Radio className="h-8 w-8 text-primary" />
          </div>
          
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
            {NAV_ITEMS.map((link) => {
              const active = isActive(link.hash);
              const Icon = link.icon;
              return (
                <Tooltip key={link.id}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.hash}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-all duration-200 relative group shadow-sm border border-white/30",
                        active 
                          ? "bg-orange-500 text-white shadow-orange-500/30" 
                          : "bg-white/60 text-slate-800 hover:bg-white hover:text-orange-500 hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {link.id === 'admin' && waitingCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1 border border-background">
                          {waitingCount}
                        </span>
                      )}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-slate-800 text-white border-0 shadow-lg rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide animate-in fade-in zoom-in-95 duration-200">{link.label}</TooltipContent>
                </Tooltip>
              );
            })}
            <div className="my-2 mx-2" />
            
            {EXTRA_ITEMS.map((link) => {
              const active = isActive(link.hash);
              const Icon = link.icon;
              return (
                <Tooltip key={link.id}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.hash}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-all duration-200 relative shadow-sm border border-white/30",
                        active 
                          ? "bg-orange-500 text-white shadow-orange-500/30" 
                          : "bg-white/60 text-slate-800 hover:bg-white hover:text-orange-500 hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-slate-800 text-white border-0 shadow-lg rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide animate-in fade-in zoom-in-95 duration-200">{link.label}</TooltipContent>
                </Tooltip>
              );
            })}

            <div className="my-2 border-b border-slate-200 mx-2" />
            
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Tooltip key={link.id}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.hash}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-all duration-200 relative bg-white/60 text-slate-800 shadow-sm border border-white/30 hover:bg-white hover:text-orange-500 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-slate-800 text-white border-0 shadow-lg rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide animate-in fade-in zoom-in-95 duration-200">{link.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
          
          <div className="p-2 flex-shrink-0 relative">
            <div className="flex items-center justify-center cursor-pointer transition-transform hover:scale-105" title="Admin">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-white/50">
                <img src="/check.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {/* ── Main Content Area ── */}
      <main className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden relative md:pl-16">
        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-transparent pb-[80px] md:pb-0">
          {children}
        </div>

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation route={route} />
      </main>
    </div>
  );
}
