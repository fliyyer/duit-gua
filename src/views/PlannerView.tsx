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

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigation & Controls Bar */}
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
            onClick={() => onOpenAddPlan()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg gap-1.5 shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Tambah Pos Anggaran</span>
          </Button>

          <Button
            variant="outline"
            onClick={onNavigateToTrackers}
            className="text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="coffee" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Buka Tracker Harian</span>
          </Button>
        </div>
      </div>

      {/* Top 6 Summary Cards (Sesuai Template Excel OTWSATUMILYAR) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 1. Pendapatan */}
        <Card className="p-4 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Pendapatan</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Icon name="trending-up" className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(totalIncome)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1">Bulan {formatMonthIndo(currentMonth)}</span>
        </Card>

        {/* 2. Uang yang Ditabung */}
        <Card className="p-4 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Ditabung</span>
            <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Icon name="target" className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(totalSavingActual)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
            <span>Rencana:</span>
            <span className="font-semibold text-foreground">{formatRupiah(totalSavingPlan)}</span>
          </div>
        </Card>

        {/* 3. Total Pengeluaran */}
        <Card className="p-4 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Pengeluaran</span>
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Icon name="trending-down" className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatRupiah(totalExpenseActual)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
            <span>Rencana:</span>
            <span className="font-semibold text-foreground">{formatRupiah(totalExpensePlan)}</span>
          </div>
        </Card>

        {/* 4. Sisa Uang Bulan Ini */}
        <Card className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm ${
          sisaUangActual >= 0
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-rose-500/5 border-rose-500/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Sisa Uang</span>
            <Badge variant={sisaUangActual >= 0 ? 'success' : 'destructive'} className="text-[10px] py-0 px-1.5">
              {sisaUangActual >= 0 ? 'Surplus' : 'Defisit'}
            </Badge>
          </div>
          <p className={`text-base sm:text-lg font-extrabold tabular-nums ${
            sisaUangActual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatRupiah(sisaUangActual)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1">Setelah tabungan & belanja</span>
        </Card>

        {/* 5. Pengeluaran Sehari-Hari */}
        <Card className="p-4 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Sehari-Hari</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Icon name="shopping-bag" className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(totalDailyExpenseActual)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1">
            {monthDailyExpenses.length} transaksi bulan ini
          </span>
        </Card>

        {/* 6. Biaya Jajan & Nongkrong */}
        <Card className="p-4 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Jajan & Nongkrong</span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Icon name="coffee" className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(totalJajanActual)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1">
            {monthJajanItems.length} kali jajan bulan ini
          </span>
        </Card>
      </div>

      {/* 4 Pilar Manajemen Keuangan Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pilar 1: Pendapatan / Income */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon name="dollar-sign" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Pendapatan / Income</h3>
                <p className="text-[11px] text-muted-foreground">Sumber penghasilan bulan ini</p>
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
              incomeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2">
                      {item.incomeType || 'Utama'}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {formatRupiah(item.actualAmount || item.plannedAmount)}
                    </span>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(item.id)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('income')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Sumber Pendapatan</span>
          </Button>
        </Card>

        {/* Pilar 2: Nabung & Investasi / Saving */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Icon name="target" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Nabung / Saving & Investasi</h3>
                <p className="text-[11px] text-muted-foreground">Alokasi dana darurat & tabungan masa depan</p>
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
                Belum ada pos tabungan atau investasi bulan ini.
              </div>
            ) : (
              savingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold py-0.5 px-2 ${
                        item.priority === 'High'
                          ? 'border-rose-500/40 text-rose-600 dark:text-rose-400'
                          : 'border-amber-500/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.priority}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {formatRupiah(item.actualAmount)}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Target: {formatRupiah(item.plannedAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(item.id)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('saving')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pos Tabungan</span>
          </Button>
        </Card>

        {/* Pilar 3: Pengeluaran Tetap / Fixed Cost */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Icon name="layers" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Pengeluaran Tetap / Fixed Cost</h3>
                <p className="text-[11px] text-muted-foreground">Kebutuhan pokok rutin wajib setiap bulan</p>
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
              fixedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2">
                      {item.priority}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {formatRupiah(item.actualAmount)}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Target: {formatRupiah(item.plannedAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(item.id)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('fixed_cost')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pos Fixed Cost</span>
          </Button>
        </Card>

        {/* Pilar 4: Pengeluaran Tidak Tetap / Variable Cost */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Icon name="shopping-bag" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Pengeluaran Tidak Tetap / Variable</h3>
                <p className="text-[11px] text-muted-foreground">Belanja harian, makan di luar & nongkrong</p>
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

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2">
                      {item.priority}
                    </Badge>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{item.title}</span>
                      {(isJajan || isSehari) && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Sinkron otomatis dari tracker
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {formatRupiah(displayActual)}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Target: {formatRupiah(item.plannedAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    {!item.isAutoCalculated && (
                      <button
                        onClick={() => onDeletePlan(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Hapus"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
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
            <span>Tambah Pos Variable Cost</span>
          </Button>
        </Card>

        {/* Pilar 5: Biaya Langganan & Hutang / Subscription & Debt */}
        <Card className="p-5 rounded-xl border bg-card shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Icon name="file-text" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Biaya Langganan & Hutang / Subscription Cost & Debt</h3>
                <p className="text-[11px] text-muted-foreground">Cicilan, PayLater, langganan digital & kuota</p>
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
              subDebtItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold py-0.5 px-2">
                      {item.priority}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums block">
                        {formatRupiah(item.actualAmount)}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Target: {formatRupiah(item.plannedAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPlan(item)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlan(item.id)}
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenAddPlan('subscription_debt')}
            className="w-full text-xs font-semibold rounded-lg gap-1.5"
          >
            <Icon name="plus" className="w-3.5 h-3.5" />
            <span>Tambah Pos Langganan / Cicilan</span>
          </Button>
        </Card>
      </div>
    </div>
  );
};
