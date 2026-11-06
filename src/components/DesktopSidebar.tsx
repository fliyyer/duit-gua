import React from 'react';
import { TabType } from '../types';
import { Icon } from './Icon';
import { formatRupiah, formatMonthIndo } from '../utils/currency';
import { Button } from './ui/button';

import { AuthUser } from '../context/AuthContext';

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
  user?: AuthUser | null;
  onLogout?: () => void;
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
  user,
  onLogout,
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
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r-2 border-border bg-card p-5 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto justify-between shadow-none">
      {/* Top Branding & Balance Widget */}
      <div className="space-y-6">
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-2 border-border shadow-brutal-sm">
            <Icon name="wallet" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-foreground tracking-tight font-heading">
              Duit Gua
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">
              Manajemen Finansial
            </p>
          </div>
        </div>

        {/* Total Net Worth Card */}
        <div className="p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">Total Saldo Aktif</span>
            <span className="text-[10px] font-bold text-foreground border border-border bg-emerald-500/20 px-2 py-0.5 rounded-md">
              {formatMonthIndo(selectedMonth)}
            </span>
          </div>
          <p className="text-lg font-extrabold text-foreground tabular-nums font-heading">
            {formatRupiah(totalBalance)}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-1.5">
          <Button
            onClick={onOpenAddTransaction}
            className="w-full font-bold text-xs rounded-lg gap-2 h-10"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Catat Transaksi (+)</span>
          </Button>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenAddDailyExpense}
              className="py-1.5 px-2 rounded-lg border-2 border-border text-[11px] font-bold bg-card hover:bg-accent text-foreground shadow-brutal-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-center flex items-center justify-center gap-1"
            >
              <Icon name="shopping-bag" className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>+ Sehari-Hari</span>
            </button>
            <button
              onClick={onOpenAddJajan}
              className="py-1.5 px-2 rounded-lg border-2 border-border text-[11px] font-bold bg-card hover:bg-accent text-foreground shadow-brutal-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-center flex items-center justify-center gap-1"
            >
              <Icon name="coffee" className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>+ Jajan</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 pt-2" aria-label="Menu Desktop">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider px-3 pb-1 block">
            Menu Utama
          </span>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-2 border-border shadow-brutal-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-2 border-transparent hover:border-border/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name={item.icon} className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-border bg-accent text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Theme & Settings */}
      <div className="pt-4 border-t-2 border-border space-y-2">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-transparent hover:border-border hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4 text-primary" />
            <span>Mode {theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </div>
          <span className="text-[10px] font-bold border border-border bg-card px-1.5 py-0.5 rounded">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 border-transparent hover:border-border hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <Icon name="settings" className="w-4 h-4" />
          <span>Pengaturan & Backup Data</span>
        </button>

        {user && (
          <div className="pt-2 border-t-2 border-border/60 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-border flex items-center justify-center text-xs font-extrabold uppercase shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-foreground truncate leading-tight">
                  {user.displayName || 'Pengguna'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {user.isGuest ? 'Mode Tamu (Lokal)' : user.email}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-7 h-7 rounded-lg border-2 border-border/80 bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                title="Keluar Akun"
                aria-label="Keluar Akun"
              >
                <Icon name="log-out" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
