"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  DoorClosed, 
  Wallet, 
  WashingMachine, 
  Settings,
  Receipt,
  Briefcase,
  Moon,
  Sun,
  LogOut as LogOutIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout, user, t, themeColor } = useData();
  const [mounted, setMounted] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: "/" },
    { icon: DoorClosed, label: t('rooms'), href: "/kamar" },
    { icon: Users, label: t('residents'), href: "/penghuni" },
    { icon: Wallet, label: t('finance'), href: "/keuangan" },
    { icon: WashingMachine, label: t('laundry'), href: "/laundry" },
    { icon: Receipt, label: t('operational'), href: "/operasional" },
    { icon: Briefcase, label: t('employees'), href: "/karyawan" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground w-full lg:w-64 lg:fixed lg:left-0 lg:top-0 border-r border-border transition-all duration-300">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Zayura Logo" 
            className="flex flex-wrap w-[246px] h-[77px] pl-0 pr-0 overflow-visible opacity-100 leading-[0] object-contain transition-transform duration-500 hover:scale-110"
          />
        </div>
        {user && <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest w-[208px] pt-0 pb-0">{t('admin')}: {user.username}</p>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? (themeColor === 'gold' ? "bg-gold-gradient text-slate-950 font-bold shadow-lg" : "bg-secondary text-secondary-foreground") 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                isActive ? (themeColor === 'gold' ? "text-slate-950" : "text-foreground") : "group-hover:text-foreground"
              )} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-2 mb-safe">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground w-full transition-colors group text-sm font-medium rounded-md hover:bg-secondary/50"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} className="text-slate-500" />
            )}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        )}
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-rose-500 hover:text-rose-600 w-full transition-colors group text-sm font-medium rounded-md hover:bg-rose-500/10"
        >
          <LogOutIcon size={18} />
          <span>{t('logout')}</span>
        </button>
        <Link 
          href="/settings"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full transition-colors group text-sm font-medium rounded-md",
            pathname === "/settings" 
              ? "bg-secondary text-secondary-foreground" 
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <Settings size={18} className={cn(
            "transition-transform",
            pathname === "/settings" ? "rotate-0" : "group-hover:rotate-45"
          )} />
          <span>{t('settings')}</span>
        </Link>
      </div>
    </div>
  );
}

