import React from 'react';
import { TabType } from '../types';
import { Icon } from './Icon';
import { formatRupiah, formatMonthIndo } from '../utils/currency';
import { Button } from './ui/button';

interface DesktopSidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  totalBalance: number;
  selectedMonth: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenAddTransaction: () => void;
  onOpenAddDailyExpense: () => void;
  onOpenAddJajan: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  totalBalance,
  selectedMonth,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenAddTransaction,
  onOpenAddDailyExpense,
  onOpenAddJajan,
}) => {
  const navItems: { id: TabType; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: 'pie-chart' },
    { id: 'planner', label: 'Rencana Keuangan', icon: 'layers' },
    { id: 'trackers', label: 'Tracker Harian', icon: 'coffee' },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: 'file-text' },
    { id: 'wallets', label: 'Dompet & Akun', icon: 'wallet' },
    { id: 'budgets', label: 'Batas Anggaran', icon: 'target' },
  ];

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r bg-card/70 backdrop-blur-md p-5 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto justify-between shadow-sm">
      {/* Top Branding & Balance Widget */}
      <div className="space-y-6">
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Icon name="wallet" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-foreground tracking-tight">
              Duit Gua
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              Manajemen Finansial
            </p>
          </div>
        </div>

        {/* Total Net Worth Card */}
        <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Saldo Aktif</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {formatMonthIndo(selectedMonth)}
            </span>
          </div>
          <p className="text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(totalBalance)}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-1.5">
          <Button
            onClick={onOpenAddTransaction}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-lg gap-2 shadow-sm h-10"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Catat Transaksi (+)</span>
          </Button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenAddDailyExpense}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-medium bg-background hover:bg-accent text-foreground transition-all text-center flex items-center justify-center gap-1"
            >
              <Icon name="shopping-bag" className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>+ Sehari-Hari</span>
            </button>
            <button
              onClick={onOpenAddJajan}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-medium bg-background hover:bg-accent text-foreground transition-all text-center flex items-center justify-center gap-1"
            >
              <Icon name="coffee" className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>+ Jajan</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 pt-2" aria-label="Menu Desktop">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-1 block">
            Menu Utama
          </span>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name={item.icon} className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Theme & Settings */}
      <div className="pt-4 border-t space-y-2">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4 text-primary" />
            <span>Mode {theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </div>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Icon name="settings" className="w-4 h-4" />
          <span>Pengaturan & Backup Data</span>
        </button>
      </div>
    </aside>
  );
};
