import React from 'react';
import { Icon } from './Icon';
import { Button } from './ui/button';

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
    <header className="lg:hidden sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md border-b transition-colors">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-3">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
            <Icon name="wallet" className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">
              Duit Gua
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground leading-none mt-0.5">
              Catatan Keuangan
            </p>
          </div>
        </div>

        {/* Action Buttons: Dark Mode & Settings */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Buka Pengaturan dan Backup Data"
            title="Pengaturan & Backup"
          >
            <Icon name="settings" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

