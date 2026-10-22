import React from 'react';
import { Icon } from './Icon';
import { formatRupiah, formatMonthIndo } from '../utils/currency';
import { Button } from './ui/button';

interface NavbarProps {
  totalBalance: number;
  selectedMonth: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalBalance,
  selectedMonth,
  theme,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md border-b transition-colors">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Icon name="wallet" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-foreground leading-tight">
                Duit Gua
              </h1>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                {formatMonthIndo(selectedMonth)}
              </span>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground tabular-nums">
              Saldo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalBalance)}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Dark Mode & Settings */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-lg text-muted-foreground hover:text-foreground"
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Buka Pengaturan dan Backup Data"
            title="Pengaturan & Backup"
          >
            <Icon name="settings" className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
