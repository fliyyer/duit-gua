import React, { useState } from 'react';
import { TabType } from '../types';
import { Icon } from './Icon';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddTransaction: () => void;
  onOpenAddDailyExpense: () => void;
  onOpenAddJajan: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenAddDailyExpense,
  onOpenAddJajan,
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <>
      {/* Quick Action Sheet on Mobile when FAB is tapped */}
      {isQuickMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-200"
          onClick={() => setIsQuickMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-auto bg-card rounded-xl border p-4 shadow-2xl space-y-2 mb-20 animate-in slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <span className="text-xs font-bold text-foreground">Catat Cepat</span>
              <button
                onClick={() => setIsQuickMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenAddTransaction();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="plus" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Catat Transaksi Umum</p>
                <p className="text-[10px] text-muted-foreground">Pemasukan, transfer atau belanja umum</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenAddDailyExpense();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Icon name="shopping-bag" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Pengeluaran Sehari-Hari</p>
                <p className="text-[10px] text-muted-foreground">Makan, bensin, galon (Qty x Harga)</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                onOpenAddJajan();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-accent text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Icon name="coffee" className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Jajan & Nongkrong</p>
                <p className="text-[10px] text-muted-foreground">Kopi, sushi, makan luar, hiburan</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t pb-[env(safe-area-inset-bottom,8px)] transition-colors shadow-lg"
        aria-label="Navigasi Menu Utama Mobile"
      >
        <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-between relative">
          {/* Tab 1: Beranda */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-lg transition-all ${
              currentTab === 'dashboard'
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
          >
            <Icon name="pie-chart" className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Beranda</span>
          </button>

          {/* Tab 2: Rencana */}
          <button
            onClick={() => onSelectTab('planner')}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-lg transition-all ${
              currentTab === 'planner'
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={currentTab === 'planner' ? 'page' : undefined}
          >
            <Icon name="layers" className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Rencana</span>
          </button>

          {/* Center Action Button: FAB */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={() => setIsQuickMenuOpen(true)}
              className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground flex items-center justify-center shadow-md transition-all border-2 border-background focus:ring-2 focus:ring-ring/30"
              aria-label="Buka Menu Tambah Cepat"
              title="Catat Cepat (+)"
            >
              <Icon name="plus" className="w-6 h-6 stroke-[2.2]" />
            </button>
          </div>

          {/* Tab 3: Tracker */}
          <button
            onClick={() => onSelectTab('trackers')}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-lg transition-all ${
              currentTab === 'trackers'
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={currentTab === 'trackers' ? 'page' : undefined}
          >
            <Icon name="coffee" className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Tracker</span>
          </button>

          {/* Tab 4: Transaksi */}
          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-lg transition-all ${
              currentTab === 'transactions'
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-current={currentTab === 'transactions' ? 'page' : undefined}
          >
            <Icon name="file-text" className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Transaksi</span>
          </button>
        </div>
      </nav>
    </>
  );
};
