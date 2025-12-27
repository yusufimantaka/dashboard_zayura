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

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: DoorClosed, label: "Kamar", href: "/kamar" },
  { icon: Users, label: "Penghuni", href: "/penghuni" },
  { icon: Wallet, label: "Keuangan", href: "/keuangan" },
  { icon: WashingMachine, label: "Laundry", href: "/laundry" },
  { icon: Receipt, label: "Biaya Ops", href: "/operasional" },
  { icon: Briefcase, label: "Karyawan", href: "/karyawan" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout, user } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground w-full lg:w-64 lg:fixed lg:left-0 lg:top-0 border-r border-border transition-all duration-300">
      <div className="p-6 pb-2">
        <h1 className="text-3xl font-normal tracking-tight font-zayura text-foreground leading-none">Zayura Exclusive</h1>
        {user && <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">Admin: {user.username}</p>}
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
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                isActive ? "text-foreground" : "group-hover:text-foreground"
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
          <span>Keluar Aplikasi</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground w-full transition-colors group text-sm font-medium rounded-md hover:bg-secondary/50">
          <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          <span>Pengaturan</span>
        </button>
      </div>
    </div>
  );
}

