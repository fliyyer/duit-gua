import React from 'react';
import { AppState, FinancialPlanItem, PlanGroupType } from '../types';
import { Icon } from '../components/Icon';
import {
  formatRupiah,
  formatMonthIndo,
  getNextMonth,
  getPrevMonth,
} from '../utils/currency';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Popconfirm } from '../components/Popconfirm';
import { InfoReminder } from '../components/InfoReminder';

interface PlannerViewProps {
  state: AppState;
  onSelectMonth: (month: string) => void;
  onOpenAddPlan: (defaultGroup?: PlanGroupType) => void;
  onEditPlan: (item: FinancialPlanItem) => void;
  onDeletePlan: (id: string) => void;
  onNavigateToTrackers: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  state,
  onSelectMonth,
  onOpenAddPlan,
  onEditPlan,
  onDeletePlan,
  onNavigateToTrackers,
}) => {
  const currentMonth = state.selectedMonth;

  // Filter items for current active month
  const monthPlans = state.plans.filter((p) => p.month === currentMonth);
  const monthDailyExpenses = state.dailyExpenses.filter((d) => d.month === currentMonth);
  const monthJajanItems = state.jajanItems.filter((j) => j.month === currentMonth);

  // Auto-calculated totals from actual trackers
  const totalDailyExpenseActual = monthDailyExpenses.reduce((sum, d) => sum + d.total, 0);
  const totalJajanActual = monthJajanItems.reduce((sum, j) => sum + j.amount, 0);

  // Group plans
  const incomeItems = monthPlans.filter((p) => p.group === 'income');
  const savingItems = monthPlans.filter((p) => p.group === 'saving');
  const fixedItems = monthPlans.filter((p) => p.group === 'fixed_cost');
  const variableItems = monthPlans.filter((p) => p.group === 'variable_cost');
  const subDebtItems = monthPlans.filter((p) => p.group === 'subscription_debt');

  // Compute Totals
  const totalIncome = incomeItems.reduce((sum, i) => sum + (i.actualAmount || i.plannedAmount), 0);

  const totalSavingPlan = savingItems.reduce((sum, i) => sum + i.plannedAmount, 0);
  const totalSavingActual = savingItems.reduce((sum, i) => sum + i.actualAmount, 0);

  const totalFixedPlan = fixedItems.reduce((sum, i) => sum + i.plannedAmount, 0);
  const totalFixedActual = fixedItems.reduce((sum, i) => sum + i.actualAmount, 0);

  // For Variable Cost, integrate auto totals
  const totalVariablePlan = variableItems.reduce((sum, i) => sum + i.plannedAmount, 0);
  const totalVariableActual = variableItems.reduce((sum, i) => {
    if (i.title.toLowerCase().includes('jajan') || i.title.toLowerCase().includes('nongkrong')) {
      return sum + (totalJajanActual > 0 ? totalJajanActual : i.actualAmount);
    }
    if (i.title.toLowerCase().includes('sehari')) {
      return sum + (totalDailyExpenseActual > 0 ? totalDailyExpenseActual : i.actualAmount);
    }
    return sum + i.actualAmount;
  }, 0);

  const totalSubDebtPlan = subDebtItems.reduce((sum, i) => sum + i.plannedAmount, 0);
  const totalSubDebtActual = subDebtItems.reduce((sum, i) => sum + i.actualAmount, 0);

  // Total Pengeluaran = Fixed + Variable + SubDebt
  const totalExpensePlan = totalFixedPlan + totalVariablePlan + totalSubDebtPlan;
  const totalExpenseActual = totalFixedActual + totalVariableActual + totalSubDebtActual;

  // Sisa Uang = Pendapatan - Pengeluaran - Tabungan
  const sisaUangActual = totalIncome - totalExpenseActual - totalSavingActual;

  // Percentage calculations
  const savingPercent = totalIncome > 0 ? Math.round((totalSavingActual / totalIncome) * 100) : 0;
  const expensePercent = totalIncome > 0 ? Math.round((totalExpenseActual / totalIncome) * 100) : 0;
  const sisaPercent = totalIncome > 0 ? Math.max(0, 100 - savingPercent - expensePercent) : 0;

  const totalAllocated = savingPercent + expensePercent;
  const savingBarWidth = totalAllocated > 100 ? (savingPercent / totalAllocated) * 100 : savingPercent;
  const expenseBarWidth = totalAllocated > 100 ? (expensePercent / totalAllocated) * 100 : expensePercent;
  const sisaBarWidth = totalAllocated > 100 ? 0 : sisaPercent;

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Month Navigation & Action Bar (Sleek 1-Row Responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSelectMonth(getPrevMonth(currentMonth))}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
              title="Bulan Sebelumnya"
              aria-label="Bulan Sebelumnya"
            >
              <Icon name="chevron-left" className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-card border-2 border-border shadow-brutal-xs">
              <Icon name="calendar" className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {formatMonthIndo(currentMonth)}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onSelectMonth(getNextMonth(currentMonth))}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
              title="Bulan Berikutnya"
              aria-label="Bulan Berikutnya"
            >
              <Icon name="chevron-right" className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile-only compact shortcut to trackers */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToTrackers}
            className="sm:hidden h-8 text-xs font-bold rounded-lg gap-1 px-2.5"
            title="Buka Tracker Harian"
          >
            <Icon name="coffee" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tracker</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpenAddPlan()}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs rounded-lg gap-1.5 px-3 sm:px-4"
          >
            <Icon name="plus" className="w-3.5 h-3.5 shrink-0" />
            <span>Tambah Rencana</span>
          </Button>

          <Button
            variant="outline"
            onClick={onNavigateToTrackers}
            className="hidden sm:inline-flex h-9 text-xs font-bold rounded-lg gap-1.5 px-3 sm:px-4"
          >
            <Icon name="coffee" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tracker Harian</span>
          </Button>
        </div>
      </div>

      {/* Ringkasan Finansial Rencana (Unified Financial Health Hero Card) */}
      <Card className="p-4 sm:p-5 rounded-xl bg-card space-y-4">
        {/* Top Headline: Surplus / Defisit & Net Free Cash */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">
                Ringkasan Rencana
              </span>
              <Badge
                variant={sisaUangActual >= 0 ? 'success' : 'destructive'}
                className="text-[10px] py-0 px-2 font-bold"
              >
                {sisaUangActual >= 0 ? 'Surplus' : 'Defisit'}
              </Badge>
              <InfoReminder
                title="Sisa Dana Bebas (Surplus / Defisit)"
                content={`Selisih antara total pendapatan dengan target tabungan (${savingPercent}%) dan rencana pengeluaran (${expensePercent}%).`}
              />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight font-heading mt-1 text-foreground">
              <span className={sisaUangActual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {sisaUangActual < 0 ? '-' : ''}{formatRupiah(Math.abs(sisaUangActual))}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Allocation Breakdown Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Alokasi Anggaran</span>
              <InfoReminder
                title="Proporsi Alokasi"
                content="Pembagian pendapatan bulanan ke dalam tabungan, kebutuhan pengeluaran, dan sisa dana bebas."
              />
            </div>
            <span className="tabular-nums font-bold text-foreground">
              Total {formatRupiah(totalIncome)}
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="w-full h-2.5 rounded-full bg-muted/60 border-2 border-border overflow-hidden flex">
            {totalIncome > 0 ? (
              <>
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${savingBarWidth}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{ width: `${expenseBarWidth}%` }}
                />
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${sisaBarWidth}%` }}
                />
              </>
            ) : (
              <div className="w-full bg-muted" />
            )}
          </div>

          {/* Clean minimal legend */}
          <div className="flex items-center gap-3 pt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              Tabungan {savingPercent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              Pengeluaran {expensePercent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Sisa {sisaPercent}%
            </span>
          </div>
        </div>

        {/* 3 Metric Columns: Pendapatan, Tabungan, Pengeluaran */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t-2 border-border">
          {/* Pendapatan */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border-2 border-border shadow-brutal-xs min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
              <Icon name="trending-up" className="w-3 h-3 shrink-0" />
              <span className="truncate">Pendapatan</span>
            </div>
            <p className="text-xs sm:text-base font-extrabold text-foreground tabular-nums truncate font-heading">
              {formatRupiah(totalIncome)}
            </p>
            <span className="text-[10px] text-muted-foreground truncate block font-medium">
              {incomeItems.length} sumber
            </span>
          </div>

          {/* Ditabung */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border-2 border-border shadow-brutal-xs min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-800 dark:text-blue-300 mb-0.5">
              <Icon name="target" className="w-3 h-3 shrink-0" />
              <span className="truncate">Ditabung</span>
            </div>
            <p className="text-xs sm:text-base font-extrabold text-foreground tabular-nums truncate font-heading">
              {formatRupiah(totalSavingActual)}
            </p>
            <span className="text-[10px] text-muted-foreground truncate block font-medium">
              Target {formatRupiah(totalSavingPlan)}
            </span>
          </div>

          {/* Pengeluaran */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 border-2 border-border shadow-brutal-xs min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 mb-0.5">
              <Icon name="trending-down" className="w-3 h-3 shrink-0" />
              <span className="truncate">Pengeluaran</span>
            </div>
            <p className="text-xs sm:text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums truncate font-heading">
              {formatRupiah(totalExpenseActual)}
            </p>
            <span className="text-[10px] text-muted-foreground truncate block font-medium">
              Target {formatRupiah(totalExpensePlan)}
            </span>
          </div>
        </div>

        {/* Quick Tracker Integration Footer */}
        <div className="pt-2 border-t-2 border-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground font-bold text-[11px]">
            <span>Tracker:</span>
            <InfoReminder
              title="Sinkronisasi Tracker Harian"
              content="Akumulasi pengeluaran harian dan catatan jajan yang tercatat pada tab Tracker Harian bulan ini."
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onNavigateToTrackers}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-border bg-card text-foreground hover:bg-accent text-[11px] font-bold shadow-brutal-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              title="Buka Tracker Pengeluaran Sehari-Hari"
            >
              <Icon name="shopping-bag" className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Sehari-Hari: {formatRupiah(totalDailyExpenseActual)}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToTrackers}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-border bg-card text-foreground hover:bg-accent text-[11px] font-bold shadow-brutal-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              title="Buka Tracker Jajan & Nongkrong"
            >
              <Icon name="coffee" className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Jajan: {formatRupiah(totalJajanActual)}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 4 Pilar Manajemen Keuangan Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pilar 1: Pendapatan / Income */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon name="dollar-sign" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Sumber Pendapatan</h3>
                <InfoReminder
                  title="Sumber Pendapatan"
                  content="Daftar seluruh penghasilan bulan ini, baik pemasukan gaji pokok, freelance, maupun passive income."
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Total</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatRupiah(totalIncome)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {incomeItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Belum ada catatan sumber pendapatan bulan ini.
              </div>
            ) : (
              incomeItems.map((item) => {
                const linkedWallet = state.wallets.find((w) => w.id === item.walletId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 shrink-0">
                        {item.incomeType || 'Utama'}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground truncate block">{item.title}</span>
                        {linkedWallet && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Icon name="wallet" className="w-2.5 h-2.5" />
                            {linkedWallet.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-foreground tabular-nums">
                        {formatRupiah(item.actualAmount || item.plannedAmount)}
                      </span>
                      <button
                        onClick={() => onEditPlan(item)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                        title="Edit"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                      </button>
                      <Popconfirm
                        title="Hapus Sumber Pendapatan?"
                        description={`Hapus "${item.title}" dari daftar pendapatan?`}
                        confirmText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => onDeletePlan(item.id)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Hapus"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('income')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pendapatan</span>
          </Button>
        </Card>

        {/* Pilar 2: Nabung & Investasi / Saving */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Icon name="target" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Nabung & Investasi</h3>
                <InfoReminder
                  title="Tabungan & Investasi"
                  content="Alokasi dana darurat, tabungan impian, reksadana, atau instrumen investasi masa depan."
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Rencana / Realisasi</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {formatRupiah(totalSavingActual)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {savingItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Belum ada rencana tabungan atau investasi bulan ini.
              </div>
            ) : (
              savingItems.map((item) => {
                const linkedWallet = state.wallets.find((w) => w.id === item.walletId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold py-0.5 px-2 shrink-0 ${
                          item.priority === 'High'
                            ? 'border-rose-500/40 text-rose-600 dark:text-rose-400'
                            : 'border-amber-500/40 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.priority}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground truncate block">{item.title}</span>
                        {linkedWallet && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Icon name="wallet" className="w-2.5 h-2.5" />
                            {linkedWallet.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground tabular-nums block">
                          {formatRupiah(item.actualAmount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums block">
                          Target: {formatRupiah(item.plannedAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => onEditPlan(item)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                        title="Edit"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                      </button>
                      <Popconfirm
                        title="Hapus Rencana Tabungan?"
                        description={`Hapus "${item.title}" dari daftar tabungan?`}
                        confirmText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => onDeletePlan(item.id)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Hapus"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('saving')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Tabungan</span>
          </Button>
        </Card>

        {/* Pilar 3: Pengeluaran Tetap / Fixed Cost */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Icon name="layers" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Pengeluaran Tetap</h3>
                <InfoReminder
                  title="Pengeluaran Tetap (Fixed Cost)"
                  content="Kebutuhan rutin wajib dengan nominal pasti yang harus dibayar setiap bulan, seperti sewa tempat tinggal, listrik rutin, wifi, atau iuran wajib."
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Rencana / Realisasi</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {formatRupiah(totalFixedActual)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {fixedItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Belum ada pengeluaran tetap bulan ini.
              </div>
            ) : (
              fixedItems.map((item) => {
                const linkedWallet = state.wallets.find((w) => w.id === item.walletId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 shrink-0">
                        {item.priority}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground truncate block">{item.title}</span>
                        {linkedWallet && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Icon name="wallet" className="w-2.5 h-2.5" />
                            {linkedWallet.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground tabular-nums block">
                          {formatRupiah(item.actualAmount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums block">
                          Target: {formatRupiah(item.plannedAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => onEditPlan(item)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                        title="Edit"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                      </button>
                      <Popconfirm
                        title="Hapus Pengeluaran Tetap?"
                        description={`Hapus "${item.title}" dari pengeluaran tetap?`}
                        confirmText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => onDeletePlan(item.id)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Hapus"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('fixed_cost')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pengeluaran Tetap</span>
          </Button>
        </Card>

        {/* Pilar 4: Pengeluaran Tidak Tetap / Variable Cost */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Icon name="shopping-bag" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Pengeluaran Variabel</h3>
                <InfoReminder
                  title="Pengeluaran Variabel"
                  content="Pengeluaran fleksibel yang nominalnya berubah-ubah sesuai konsumsi harian, seperti belanja dapur dan nongkrong/jajan."
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Rencana / Realisasi</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {formatRupiah(totalVariableActual)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {variableItems.map((item) => {
              const isJajan = item.title.toLowerCase().includes('jajan') || item.title.toLowerCase().includes('nongkrong');
              const isSehari = item.title.toLowerCase().includes('sehari');
              const displayActual = isJajan && totalJajanActual > 0
                ? totalJajanActual
                : isSehari && totalDailyExpenseActual > 0
                ? totalDailyExpenseActual
                : item.actualAmount;
              const linkedWallet = state.wallets.find((w) => w.id === item.walletId);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 shrink-0">
                      {item.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
                        {(isJajan || isSehari) && (
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0">
                            Sinkron
                          </span>
                        )}
                      </div>
                      {!isJajan && !isSehari && linkedWallet && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Icon name="wallet" className="w-2.5 h-2.5" />
                          {linkedWallet.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {formatRupiah(displayActual)}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums block">
                        Target: {formatRupiah(item.plannedAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    {!item.isAutoCalculated && (
                      <Popconfirm
                        title="Hapus Pengeluaran Variabel?"
                        description={`Hapus "${item.title}" dari pengeluaran variabel?`}
                        confirmText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => onDeletePlan(item.id)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Hapus"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('variable_cost')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pengeluaran Variabel</span>
          </Button>
        </Card>

        {/* Pilar 5: Biaya Langganan & Hutang / Subscription & Debt */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Icon name="file-text" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Langganan & Cicilan</h3>
                <InfoReminder
                  title="Langganan & Cicilan"
                  content="Kewajiban berkala meliputi cicilan barang, PayLater, tagihan kredit, kuota internet, dan langganan aplikasi digital bulanan."
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Rencana / Realisasi</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRupiah(totalSubDebtActual)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subDebtItems.length === 0 ? (
              <div className="py-6 col-span-2 text-center text-xs text-muted-foreground">
                Tidak ada cicilan atau biaya langganan bulan ini.
              </div>
            ) : (
              subDebtItems.map((item) => {
                const linkedWallet = state.wallets.find((w) => w.id === item.walletId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2 shrink-0">
                        {item.priority}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-foreground truncate block">{item.title}</span>
                        {linkedWallet && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Icon name="wallet" className="w-2.5 h-2.5" />
                            {linkedWallet.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground tabular-nums block">
                          {formatRupiah(item.actualAmount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums block">
                          Target: {formatRupiah(item.plannedAmount)}
                        </span>
                      </div>
                      <button
                        onClick={() => onEditPlan(item)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                        title="Edit"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                      </button>
                      <Popconfirm
                        title="Hapus Langganan / Cicilan?"
                        description={`Hapus "${item.title}" dari daftar tagihan?`}
                        confirmText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => onDeletePlan(item.id)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Hapus"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('subscription_debt')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Langganan / Cicilan</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};
