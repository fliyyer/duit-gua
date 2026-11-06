import React from 'react';
import { Icon } from './Icon';

interface NavbarProps {
  totalBalance?: number;
  selectedMonth?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
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
            <p className="text-[11px] font-medium text-muted-foreground leading-none mt-0.5">
              Catatan Keuangan
            </p>
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
        </div>
      </div>
    </header>
  );
};

