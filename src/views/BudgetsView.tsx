import React from 'react';
import { AppState, Budget } from '../types';
import { formatRupiah, getCurrentMonthString } from '../utils/currency';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Popconfirm } from '../components/Popconfirm';

interface BudgetsViewProps {
  state: AppState;
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  state,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const currentMonth = getCurrentMonthString();

  const monthExpenses = state.transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  const budgetStats = state.budgets.map((b) => {
    const category = state.categories.find((c) => c.id === b.categoryId);
    const spent = monthExpenses
      .filter((t) => t.categoryId === b.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = b.monthlyLimit - spent;
    const percent = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
    const isOver = spent > b.monthlyLimit;

    return {
      ...b,
      categoryName: category?.name || 'Kategori Pengeluaran',
      categoryIcon: category?.icon || 'target',
      categoryColor: category?.color || '#059669',
      spent,
      remaining,
      percent,
      isOver,
    };
  });

  const totalBudgetLimit = state.budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalBudgetSpent = budgetStats.reduce((s, b) => s + b.spent, 0);
  const overallPercent = totalBudgetLimit > 0 ? Math.min(100, (totalBudgetSpent / totalBudgetLimit) * 100) : 0;
  const isOverallOver = totalBudgetSpent > totalBudgetLimit;

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Header Info Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-card via-card to-emerald-500/5">
        <div className="flex items-center justify-between mb-3 border-b-2 border-border pb-2.5">
          <span className="text-xs font-bold text-muted-foreground">
            Batas Anggaran Bulan Ini
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-muted border-2 border-border shadow-brutal-xs font-bold text-foreground">
            {state.budgets.length} Kategori Aktif
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-foreground font-heading">
              {formatRupiah(totalBudgetSpent)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              dari batas anggaran {formatRupiah(totalBudgetLimit)}
            </p>
          </div>
          <Badge
            variant={isOverallOver ? "destructive" : "success"}
            className="tabular-nums font-bold border-2"
          >
            {overallPercent.toFixed(0)}% terpakai
          </Badge>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border-2 border-border mb-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverallOver ? 'bg-rose-500' : overallPercent > 80 ? 'bg-amber-400' : 'bg-primary'
            }`}
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <Button
          onClick={onOpenAddBudget}
          className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-brutal-sm"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Pasang Batas Anggaran Baru</span>
        </Button>
      </Card>

      {/* List Kategori Anggaran */}
      {budgetStats.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Icon name="target" className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Belum Ada Anggaran Bulanan
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Buat batas belanja untuk kategori seperti makanan, bensin, atau nongkrong agar keuangan tetap terkendali.
          </p>
          <Button
            onClick={onOpenAddBudget}
            size="sm"
            className="mt-4 rounded-lg text-xs font-semibold"
          >
            + Mulai Buat Anggaran
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground font-medium">
            <span>Daftar Kategori</span>
            <span>Terpakai vs Batas Anggaran</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetStats.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-border shadow-brutal-xs flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${item.categoryColor}20`,
                      color: item.categoryColor,
                    }}
                  >
                    <Icon name={item.categoryIcon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {item.categoryName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.isOver ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Kelebihan {formatRupiah(Math.abs(item.remaining))}
                        </span>
                      ) : (
                        <span className="font-semibold">Sisa {formatRupiah(item.remaining)}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={item.isOver ? "destructive" : item.percent > 80 ? "warning" : "success"}
                    className="tabular-nums font-bold border-2"
                  >
                    {item.percent}%
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditBudget(item)}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground border border-border/40 shadow-brutal-xs"
                    title="Ubah Anggaran"
                  >
                    <Icon name="edit" className="w-3.5 h-3.5" />
                  </Button>
                  <Popconfirm
                    title="Hapus Batas Anggaran?"
                    description={`Hapus batas anggaran untuk kategori "${item.categoryName}"?`}
                    confirmText="Hapus"
                    cancelText="Batal"
                    onConfirm={() => onDeleteBudget(item.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/40 shadow-brutal-xs"
                      title="Hapus Anggaran"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </Button>
                  </Popconfirm>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress
                value={item.percent}
                className="h-2"
                indicatorClassName={
                  item.isOver
                    ? 'bg-rose-500'
                    : item.percent > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }
              />

              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground tabular-nums gap-2">
                <span className="truncate">{formatRupiah(item.spent)} terpakai</span>
                <span className="shrink-0">Batas: {formatRupiah(item.monthlyLimit)}</span>
              </div>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};
