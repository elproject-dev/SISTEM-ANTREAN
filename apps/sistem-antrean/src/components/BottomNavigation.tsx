import { useState, useMemo } from "react";
import { 
  LayoutDashboard, 
  Radio, 
  Monitor, 
  History, 
  Menu, 
  Tv2, 
  Globe, 
  Settings,
  ChevronRight,
  Users
} from "lucide-react";
import { cn } from "@elproject/ui";

interface BottomNavigationProps {
  route: string;
}

export function BottomNavigation({ route }: BottomNavigationProps) {
  const [showMore, setShowMore] = useState(false);

  const mainLinks = useMemo(() => [
    { href: "#/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "#/antrean", label: "Antrean", icon: Radio },
    { href: "#/operator", label: "Operator", icon: Monitor },
    { href: "#/history", label: "Riwayat", icon: History },
  ], []);

  const moreLinks = useMemo(() => [
    { href: "#/tv", label: "TV Display", icon: Tv2, external: true },
    { href: "#/public", label: "Web Publik", icon: Globe, external: true },
    { href: "#/staff", label: "Staff", icon: Users },
    { href: "#/settings", label: "Pengaturan", icon: Settings },
  ], []);

  const isActive = (hash: string) => {
    if (hash === '#/dashboard' && (route === '/dashboard' || route === '/')) return true;
    return route === hash.replace('#', '');
  };

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Menu Modal untuk layar Mobile */}
      <div 
        className={cn(
          "fixed bottom-[72px] left-4 right-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl z-50 md:hidden transition-all duration-300 origin-bottom",
          showMore ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="p-2 flex flex-col gap-1">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tampilan Lain & Pengaturan
          </div>
          {moreLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                onClick={() => !link.external && setShowMore(false)}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-foreground">{link.label}</span>
                {link.external && <ChevronRight className="w-4 h-4 opacity-40" />}
              </a>
            );
          })}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-md border-t border-white/20 md:hidden z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-2xl">
        <div className="flex items-center justify-around py-2 px-1 relative z-10 rounded-t-2xl">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 relative",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-colors mb-1 relative",
                  active ? "bg-primary/10" : ""
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none whitespace-nowrap">
                  {link.label}
                </span>
              </a>
            );
          })}
          
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200",
              showMore ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full transition-colors mb-1",
              showMore ? "bg-primary/10" : ""
            )}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium leading-none whitespace-nowrap">
              Lainnya
            </span>
          </button>
        </div>
        
        {/* Environment Safe Area untuk iOS/Notch Devices */}
        <div className="h-[env(safe-area-inset-bottom)] bg-transparent w-full" />
      </nav>
    </>
  );
}
