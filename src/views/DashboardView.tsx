import React from 'react';
import { AppState, TabType, Transaction } from '../types';
import { formatRupiah, getCurrentMonthString, formatMonthIndo, formatDateIndo } from '../utils/currency';
import { Icon } from '../components/Icon';
import { CategoryExpenseChart } from '../components/Charts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

interface DashboardViewProps {
  state: AppState;
  onSelectTab: (tab: TabType) => void;
  onOpenAddTransaction: () => void;
  onOpenTransfer: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onSelectTab,
  onOpenAddTransaction,
  onOpenTransfer,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const currentMonth = state.selectedMonth || getCurrentMonthString();

  const monthTransactions = state.transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);

  const recentTransactions = [...state.transactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const budgetsWithSpending = state.budgets.map((b) => {
    const spent = monthTransactions
      .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    const category = state.categories.find((c) => c.id === b.categoryId);
    const percent = Math.min(100, (spent / b.monthlyLimit) * 100);
    return {
      ...b,
      categoryName: category ? category.name : 'Kategori Pengeluaran',
      categoryColor: category ? category.color : '#059669',
      spent,
      percent,
      isOver: spent > b.monthlyLimit,
    };
  });

  // Calculate monthly stats from template trackers
  const monthDailyExpenses = state.dailyExpenses.filter((d) => d.month === currentMonth);
  const totalDailyExpense = monthDailyExpenses.reduce((sum, d) => sum + d.total, 0);

  const monthJajanItems = state.jajanItems.filter((j) => j.month === currentMonth);
  const totalJajan = monthJajanItems.reduce((sum, j) => sum + j.amount, 0);

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Top Banner on Desktop & Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kartu Saldo Utama & Arus Kas Terintegrasi (Combined Hero Banner) */}
        <Card className="lg:col-span-2 p-5 sm:p-6 bg-gradient-to-br from-card via-card to-emerald-500/5 flex flex-col justify-between gap-4">
          {/* Header Row: Title, Month Badge, and Wallets Link */}
          <div className="flex items-center justify-between border-b-2 border-border pb-2.5 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs font-bold text-muted-foreground truncate">
                Total Saldo Bersih
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border-2 border-emerald-500/30 shadow-brutal-xs shrink-0">
                {formatMonthIndo(currentMonth)}
              </span>
            </div>
            <button
              onClick={() => onSelectTab('wallets')}
              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 hover:bg-accent px-2 py-1 rounded-md transition-colors shrink-0"
              title="Lihat rincian semua dompet"
            >
              <span>{state.wallets.length} Dompet</span>
              <Icon name="chevron-right" className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2-Column Responsive Body: Left = Saldo & Quick Actions, Right = Cashflow Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* Left Side: Saldo Utama & Action Buttons */}
            <div className="flex flex-col justify-between gap-3">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tabular-nums tracking-tight text-foreground break-words font-heading">
                  {formatRupiah(totalBalance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Akumulasi kas tunai, rekening & e-wallet
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  onClick={onOpenAddTransaction}
                  className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-2 sm:px-3"
                >
                  <Icon name="plus" className="w-4 h-4 shrink-0" />
                  <span className="truncate">Catat Transaksi</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={onOpenTransfer}
                  className="h-9 rounded-lg text-xs font-bold gap-1.5 hover:bg-accent px-2 sm:px-3"
                >
                  <Icon name="arrow-left-right" className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">Pindah Saldo</span>
                </Button>
              </div>
            </div>

            {/* Right Side: Integrated Cashflow (Arus Kas Periode Ini) */}
            <div className="p-3.5 rounded-xl border-2 border-border shadow-brutal-xs bg-muted/30 dark:bg-muted/15 flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-2 border-border shadow-brutal-xs flex items-center justify-center shrink-0">
                    <Icon name="trending-up" className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate">
                    Arus Kas (Cashflow)
                  </span>
                </div>
                <Badge
                  variant={netCashflow >= 0 ? "success" : "destructive"}
                  className="tabular-nums font-bold text-[11px] py-0.5 px-2 shrink-0 border-2"
                >
                  {netCashflow >= 0 ? 'Surplus ' : 'Defisit '}
                  {formatRupiah(netCashflow)}
                </Badge>
              </div>

              {/* Pemasukan vs Pengeluaran mini cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border-2 border-emerald-500/30 shadow-brutal-xs min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                    <Icon name="trending-up" className="w-3 h-3 shrink-0" />
                    <span className="truncate">Pemasukan</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums truncate font-heading">
                    +{formatRupiah(totalIncome)}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-500/10 border-2 border-rose-500/30 shadow-brutal-xs min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800 dark:text-rose-300 mb-0.5">
                    <Icon name="trending-down" className="w-3 h-3 shrink-0" />
                    <span className="truncate">Pengeluaran</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-400 tabular-nums truncate font-heading">
                    -{formatRupiah(totalExpense)}
                  </p>
                </div>
              </div>

              {/* Progress bar visual ratio */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span>Rasio Pengeluaran</span>
                  <span className="tabular-nums font-bold text-foreground">
                    {totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : (totalExpense > 0 ? 100 : 0)}%
                  </span>
                </div>
                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalExpense > totalIncome
                        ? 'bg-rose-500'
                        : (totalIncome > 0 && totalExpense / totalIncome > 0.8)
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : (totalExpense > 0 ? 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Shortcut Card to OTWSATUMILYAR Trackers */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b-2 border-border pb-2">
            <div>
              <h3 className="text-xs font-bold text-foreground">Tracker Harian Bulan Ini</h3>
              <p className="text-[11px] text-muted-foreground">{formatMonthIndo(currentMonth)}</p>
            </div>
            <button
              onClick={() => onSelectTab('trackers')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Buka</span>
              <Icon name="chevron-right" className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => onSelectTab('trackers')}
              className="p-3 rounded-lg border-2 border-border shadow-brutal-xs bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border-2 border-border shadow-brutal-xs flex items-center justify-center">
                  <Icon name="shopping-bag" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">Pengeluaran Sehari-Hari</span>
                  <span className="text-[10px] text-muted-foreground">{monthDailyExpenses.length} transaksi</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums font-heading">
                {formatRupiah(totalDailyExpense)}
              </span>
            </div>

            <div
              onClick={() => onSelectTab('trackers')}
              className="p-3 rounded-lg border-2 border-border shadow-brutal-xs bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border-2 border-border shadow-brutal-xs flex items-center justify-center">
                  <Icon name="coffee" className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">Jajan & Nongkrong</span>
                  <span className="text-[10px] text-muted-foreground">{monthJajanItems.length} sesi</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 tabular-nums font-heading">
                {formatRupiah(totalJajan)}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectTab('planner')}
            className="w-full text-xs font-bold rounded-lg gap-1.5"
          >
            <Icon name="layers" className="w-3.5 h-3.5 text-primary" />
            <span>Lihat Rencana 4 Pilar</span>
          </Button>
        </Card>
      </div>

      {/* Main Responsive Grid Layout (Desktop: 2 columns, Mobile: stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri / Utama (2 Kolom di Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grafik Proporsi Pengeluaran */}
          <CategoryExpenseChart
            transactions={monthTransactions}
            categories={state.categories}
          />

          {/* Riwayat Transaksi Terbaru */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Transaksi Terkini</CardTitle>
                <CardDescription>Catatan paling baru di akun Anda</CardDescription>
              </div>
              <button
                onClick={() => onSelectTab('transactions')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            </CardHeader>

            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mb-2">
                    <Icon name="file-text" className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Belum Ada Transaksi
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Klik tombol di bawah untuk mencatat transaksi pertama Anda.
                  </p>
                  <Button
                    onClick={onOpenAddTransaction}
                    size="sm"
                    className="mt-3.5 rounded-lg text-xs font-semibold"
                  >
                    + Catat Sekarang
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {recentTransactions.map((tx) => {
                    const category = state.categories.find((c) => c.id === tx.categoryId);
                    const wallet = state.wallets.find((w) => w.id === tx.walletId);
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    const toWallet = tx.toWalletId
                      ? state.wallets.find((w) => w.id === tx.toWalletId)
                      : null;

                    return (
                      <div
                        key={tx.id}
                        className="py-2.5 flex items-center justify-between group hover:bg-muted/40 rounded-lg px-2 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isTransfer
                                ? 'rgba(14, 165, 233, 0.15)'
                                : category
                                ? `${category.color}20`
                                : 'rgba(148, 163, 184, 0.2)',
                              color: isTransfer ? '#0284c7' : category ? category.color : 'inherit',
                            }}
                          >
                            <Icon
                              name={
                                isTransfer
                                  ? 'arrow-left-right'
                                  : category
                                  ? category.icon
                                  : isIncome
                                  ? 'trending-up'
                                  : 'trending-down'
                              }
                              className="w-4 h-4"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">
                              {isTransfer
                                ? `Pindah: ${wallet?.name || 'Dompet'} ke ${toWallet?.name || 'Dompet'}`
                                : category?.name || 'Transaksi'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate mt-0.5">
                              <span className="font-semibold text-foreground/80 shrink-0">
                                {formatDateIndo(tx.date, true)}
                              </span>
                              <span>•</span>
                              <span className="truncate">{wallet?.name || 'Dompet'}</span>
                              {tx.note && (
                                <>
                                  <span>•</span>
                                  <span className="italic truncate">{tx.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p
                              className={`text-xs font-extrabold tabular-nums ${
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isTransfer
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : isTransfer ? '' : '-'}
                              {formatRupiah(tx.amount)}
                            </p>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditTransaction(tx)}
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                              title="Ubah"
                            >
                              <Icon name="edit" className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Hapus"
                            >
                              <Icon name="trash" className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan / Sidebar Info (1 Kolom di Desktop) */}
        <div className="space-y-6">
          {/* Pantauan Anggaran Bulan Ini */}
          {budgetsWithSpending.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Pantauan Anggaran</CardTitle>
                  <CardDescription>Batas pengeluaran per kategori</CardDescription>
                </div>
                <button
                  onClick={() => onSelectTab('budgets')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Kelola
                </button>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {budgetsWithSpending.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {item.categoryName}
                      </span>
                      <span
                        className={`font-semibold tabular-nums ${
                          item.isOver
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatRupiah(item.spent)} / {formatRupiah(item.monthlyLimit)}
                      </span>
                    </div>
                    <Progress
                      value={item.percent}
                      className="h-2"
                      indicatorClassName={
                        item.isOver
                          ? 'bg-rose-500'
                          : item.percent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dompet & Rekening Ringkas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Rincian Dompet & Rekening</CardTitle>
                <CardDescription>{state.wallets.length} sumber dana aktif</CardDescription>
              </div>
              <button
                onClick={() => onSelectTab('wallets')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Kelola</span>
                <Icon name="chevron-right" className="w-3 h-3" />
              </button>
            </CardHeader>

            <CardContent className="space-y-2">
              {state.wallets.map((w) => {
                const getWalletTypeBadge = (type: string) => {
                  switch (type) {
                    case 'cash':
                      return 'Tunai';
                    case 'bank':
                      return 'Bank';
                    case 'ewallet':
                      return 'E-Wallet';
                    case 'investment':
                      return 'Investasi';
                    default:
                      return 'Dompet';
                  }
                };

                return (
                  <div
                    key={w.id}
                    onClick={() => onSelectTab('wallets')}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
                    title={`Klik untuk mengelola dompet ${w.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: w.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {w.name}
                          </p>
                          <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                            {getWalletTypeBadge(w.type)}
                          </span>
                        </div>
                        {w.accountNumber && (
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {w.accountNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground tabular-nums shrink-0">
                      {formatRupiah(w.balance)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
