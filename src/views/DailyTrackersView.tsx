import React, { useState } from 'react';
import { AppState, DailyExpenseItem, JajanItem } from '../types';
import { Icon } from '../components/Icon';
import {
  formatRupiah,
  formatMonthIndo,
  getNextMonth,
  getPrevMonth,
  formatDateIndo,
} from '../utils/currency';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

interface DailyTrackersViewProps {
  state: AppState;
  onSelectMonth: (month: string) => void;
  onOpenAddDailyExpense: () => void;
  onEditDailyExpense: (item: DailyExpenseItem) => void;
  onDeleteDailyExpense: (id: string) => void;
  onOpenAddJajan: () => void;
  onEditJajan: (item: JajanItem) => void;
  onDeleteJajan: (id: string) => void;
}

export const DailyTrackersView: React.FC<DailyTrackersViewProps> = ({
  state,
  onSelectMonth,
  onOpenAddDailyExpense,
  onEditDailyExpense,
  onDeleteDailyExpense,
  onOpenAddJajan,
  onEditJajan,
  onDeleteJajan,
}) => {
  const currentMonth = state.selectedMonth;
  const [activeMobileTab, setActiveMobileTab] = useState<'daily' | 'jajan'>('daily');

  // Filter items for current active month
  const dailyExpenses = state.dailyExpenses
    .filter((d) => d.month === currentMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  const jajanItems = state.jajanItems
    .filter((j) => j.month === currentMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute stats
  const totalDailyExpense = dailyExpenses.reduce((sum, d) => sum + d.total, 0);
  const totalDailyCount = dailyExpenses.length;

  const totalJajanAmount = jajanItems.reduce((sum, j) => sum + j.amount, 0);
  const totalJajanCount = jajanItems.length;

  const getWalletName = (id: string) => {
    return state.wallets.find((w) => w.id === id)?.name || 'Dompet';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigation & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-card border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectMonth(getPrevMonth(currentMonth))}
            className="h-9 w-9 rounded-lg"
            title="Bulan Sebelumnya"
            aria-label="Bulan Sebelumnya"
          >
            <Icon name="chevron-left" className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
            <Icon name="calendar" className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {formatMonthIndo(currentMonth)}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onSelectMonth(getNextMonth(currentMonth))}
            className="h-9 w-9 rounded-lg"
            title="Bulan Berikutnya"
            aria-label="Bulan Berikutnya"
          >
            <Icon name="chevron-right" className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenAddDailyExpense}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg gap-1.5 shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>+ Belanja Harian</span>
          </Button>

          <Button
            onClick={onOpenAddJajan}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg gap-1.5 shadow-sm"
          >
            <Icon name="coffee" className="w-4 h-4" />
            <span>+ Jajan / Nongkrong</span>
          </Button>
        </div>
      </div>

      {/* Top Combined Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border bg-card shadow-sm">
          <span className="text-[11px] font-medium text-muted-foreground block mb-1">
            Pengeluaran Sehari-Hari
          </span>
          <p className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
            {formatRupiah(totalDailyExpense)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Bulan {formatMonthIndo(currentMonth)}
          </span>
        </Card>

        <Card className="p-4 rounded-xl border bg-card shadow-sm">
          <span className="text-[11px] font-medium text-muted-foreground block mb-1">
            Jumlah Transaksi Sehari-Hari
          </span>
          <p className="text-base sm:text-xl font-extrabold text-foreground tabular-nums">
            {totalDailyCount} Transaksi
          </p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Frekuensi belanja harian
          </span>
        </Card>

        <Card className="p-4 rounded-xl border bg-card shadow-sm">
          <span className="text-[11px] font-medium text-muted-foreground block mb-1">
            Total Biaya Jajan & Nongkrong
          </span>
          <p className="text-base sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 tabular-nums">
            {formatRupiah(totalJajanAmount)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Kopi, makan luar, hiburan
          </span>
        </Card>

        <Card className="p-4 rounded-xl border bg-card shadow-sm">
          <span className="text-[11px] font-medium text-muted-foreground block mb-1">
            Frekuensi Jajan & Nongkrong
          </span>
          <p className="text-base sm:text-xl font-extrabold text-foreground tabular-nums">
            {totalJajanCount} Kali Jajan
          </p>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Total sesi nongkrong
          </span>
        </Card>
      </div>

      {/* Mobile Tab Switcher (Visible on mobile only; on desktop, both are displayed side-by-side!) */}
      <div className="lg:hidden">
        <Tabs value={activeMobileTab} onValueChange={(v) => setActiveMobileTab(v as 'daily' | 'jajan')}>
          <TabsList className="w-full grid grid-cols-2 h-11">
            <TabsTrigger value="daily" className="text-xs font-semibold gap-1.5">
              <Icon name="shopping-bag" className="w-3.5 h-3.5" />
              <span>Sehari-Hari ({totalDailyCount})</span>
            </TabsTrigger>
            <TabsTrigger value="jajan" className="text-xs font-semibold gap-1.5">
              <Icon name="coffee" className="w-3.5 h-3.5" />
              <span>Jajan & Nongkrong ({totalJajanCount})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trackers Content: Side-by-Side on Desktop (lg:grid-cols-2), Tab-switched or stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TRACKER 1: Tracker Pengeluaran Sehari-Hari */}
        <Card
          className={`p-5 rounded-xl border bg-card shadow-sm space-y-4 ${
            activeMobileTab !== 'daily' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Icon name="shopping-bag" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Tracker Pengeluaran Sehari-Hari
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Catatan kebutuhan rutin, bensin, galon, ojol (Qty x Harga)
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onOpenAddDailyExpense}
              className="text-xs font-semibold rounded-lg gap-1"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Button>
          </div>

          {/* List / Table Items */}
          <div className="space-y-2">
            {dailyExpenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                Belum ada catatan belanja sehari-hari di bulan ini.
              </div>
            ) : (
              dailyExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {item.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                        {item.quantity}x
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDateIndo(item.date)}</span>
                      <span>•</span>
                      <span>@ {formatRupiah(item.price)}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground/80">{getWalletName(item.walletId)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-foreground tabular-nums">
                      {formatRupiah(item.total)}
                    </span>
                    <button
                      onClick={() => onEditDailyExpense(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Ubah"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDailyExpense(item.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* TRACKER 2: Tracker Jajan / Nongkrong */}
        <Card
          className={`p-5 rounded-xl border bg-card shadow-sm space-y-4 ${
            activeMobileTab !== 'jajan' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Icon name="coffee" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Tracker Jajan / Nongkrong
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Catatan ngopi, makan enak, nonton & hiburan
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onOpenAddJajan}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg gap-1"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Button>
          </div>

          {/* List / Table Items */}
          <div className="space-y-2">
            {jajanItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                Belum ada catatan jajan atau nongkrong di bulan ini.
              </div>
            ) : (
              jajanItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDateIndo(item.date)}</span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="italic text-foreground/70">{item.note}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-medium text-foreground/80">{getWalletName(item.walletId)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 tabular-nums">
                      {formatRupiah(item.amount)}
                    </span>
                    <button
                      onClick={() => onEditJajan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Ubah"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteJajan(item.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
