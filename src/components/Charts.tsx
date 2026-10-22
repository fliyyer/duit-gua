import React from 'react';
import { Category, Transaction } from '../types';
import { formatRupiah } from '../utils/currency';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface CategoryExpenseChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({
  transactions,
  categories,
}) => {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpense === 0 || expenseTxs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada catatan pengeluaran di periode ini untuk dianalisis.
        </p>
      </Card>
    );
  }

  const categoryTotals: { [catId: string]: number } = {};
  expenseTxs.forEach((t) => {
    const catId = t.categoryId || 'other';
    categoryTotals[catId] = (categoryTotals[catId] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat ? cat.name : 'Pengeluaran Lain',
        color: cat ? cat.color : '#64748b',
        amount,
        percentage: (amount / totalExpense) * 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  let cumulativeAngle = 0;
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Proporsi Pengeluaran</CardTitle>
          <CardDescription>Kategori pengeluaran terbesar periode ini</CardDescription>
        </div>
        <Badge variant="secondary" className="font-semibold text-xs tabular-nums">
          {formatRupiah(totalExpense)}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Donut */}
          <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-label="Grafik Donut Pengeluaran">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-muted"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {sortedCategories.map((item) => {
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
                cumulativeAngle += item.percentage;

                return (
                  <circle
                    key={item.id}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                Pengeluaran
              </span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {sortedCategories.length} Pos
              </span>
            </div>
          </div>

          {/* Legend & Breakdown List */}
          <div className="flex-1 w-full flex flex-col gap-2.5">
            {sortedCategories.slice(0, 5).map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[60%]">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-foreground truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] w-9 text-right">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {sortedCategories.length > 5 && (
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                + {sortedCategories.length - 5} kategori lainnya
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CashflowBarProps {
  income: number;
  expense: number;
}

export const CashflowBar: React.FC<CashflowBarProps> = ({ income, expense }) => {
  const net = income - expense;
  const isPositive = net >= 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Arus Kas Periode Ini (Cashflow)
        </span>
        <Badge
          variant={isPositive ? "success" : "destructive"}
          className="tabular-nums font-bold"
        >
          {isPositive ? 'Surplus ' : 'Defisit '}
          {formatRupiah(net)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            Total Pemasukan
          </p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            +{formatRupiah(income)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">
            Total Pengeluaran
          </p>
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400 tabular-nums">
            -{formatRupiah(expense)}
          </p>
        </div>
      </div>
    </Card>
  );
};
