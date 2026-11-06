import React from 'react';
import { Icon } from './Icon';

import { AuthUser } from '../context/AuthContext';

interface NavbarProps {
  totalBalance?: number;
  selectedMonth?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  user,
  onLogout,
  syncStatus = 'idle',
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md border-b-2 border-border transition-colors">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-3">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center border-2 border-border shadow-brutal-xs shrink-0">
            <Icon name="wallet" className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-foreground leading-tight tracking-tight font-heading">
              Duit Gua
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-muted-foreground/50'
              }`} />
              <p className="text-[11px] font-medium text-muted-foreground leading-none truncate">
                {syncStatus === 'syncing' ? 'Menyinkronkan...' : user?.isGuest ? 'Mode Tamu (Lokal)' : 'Cloud Firebase'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Dark Mode & Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg border-2 border-border bg-card text-foreground hover:bg-accent shadow-brutal-xs flex items-center justify-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg border-2 border-border bg-card text-foreground hover:bg-accent shadow-brutal-xs flex items-center justify-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            aria-label="Buka Pengaturan dan Backup Data"
            title="Pengaturan & Backup"
          >
            <Icon name="settings" className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-8 h-8 rounded-lg border-2 border-border bg-card text-destructive hover:bg-destructive/10 shadow-brutal-xs flex items-center justify-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ml-0.5"
              aria-label="Keluar akun"
              title={user ? `Keluar (${user.displayName || user.email})` : 'Keluar'}
            >
              <Icon name="log-out" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

