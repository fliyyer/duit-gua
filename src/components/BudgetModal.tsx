import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../types';
import { Icon } from './Icon';
import { formatRupiah, getCurrentMonthString, parseNumberInput } from '../utils/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>, existingId?: string) => void;
  categories: Category[];
  existingBudget?: Budget | null;
  currentMonth: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  existingBudget,
  currentMonth,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [rawLimit, setRawLimit] = useState<string>('');
  const [error, setError] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (!isOpen) return;
    if (existingBudget) {
      setCategoryId(existingBudget.categoryId);
      setRawLimit(existingBudget.monthlyLimit.toString());
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setRawLimit('');
    }
    setError('');
  }, [isOpen, existingBudget, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseNumberInput(rawLimit);

    if (limit <= 0) {
      setError('Batas anggaran harus lebih dari Rp 0');
      return;
    }

    if (!categoryId) {
      setError('Silakan tentukan kategori pengeluaran');
      return;
    }

    onSave(
      {
        categoryId,
        monthlyLimit: limit,
        month: currentMonth || getCurrentMonthString(),
      },
      existingBudget?.id
    );

    onClose();
  };

  const numericLimit = parseNumberInput(rawLimit);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="target" className="w-4 h-4" />
            </div>
            <DialogTitle>
              {existingBudget ? 'Ubah Batas Anggaran' : 'Atur Batas Anggaran'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Kategori Pengeluaran */}
          <div>
            <label htmlFor="budget-category" className="block text-xs font-bold text-foreground mb-1.5">
              Pilih Kategori Pos Pengeluaran
            </label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!existingBudget}
              className="w-full p-2.5 rounded-lg border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batas Anggaran Bulanan */}
          <div className="bg-muted/40 p-4 rounded-xl border flex flex-col items-center">
            <label htmlFor="budget-limit" className="text-xs font-medium text-muted-foreground mb-1">
              Batas Maksimal Bulanan
            </label>
            <input
              id="budget-limit"
              type="text"
              inputMode="numeric"
              value={numericLimit > 0 ? formatRupiah(numericLimit, false) : ''}
              onChange={(e) => {
                const num = parseNumberInput(e.target.value);
                setRawLimit(num === 0 ? '' : num.toString());
                setError('');
              }}
              placeholder="0"
              autoFocus
              className="w-full text-center text-2xl sm:text-3xl font-extrabold text-foreground bg-transparent border-none outline-none tabular-nums placeholder:text-muted-foreground/40"
            />
            <span className="text-xs text-muted-foreground mt-1">Rupiah per bulan</span>

            {/* Quick additions */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t w-full">
              {[200000, 500000, 1000000, 2000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const cur = parseNumberInput(rawLimit);
                    setRawLimit((cur + val).toString());
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-background border hover:bg-accent text-foreground transition-all active:scale-95"
                >
                  +{val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-[2] bg-primary text-primary-foreground font-bold"
            >
              Pasang Anggaran
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
