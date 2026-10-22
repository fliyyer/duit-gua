import React, { useState, useEffect } from 'react';
import { FinancialPlanItem, IncomeCategoryType, PlanGroupType, PlanPriority } from '../types';
import { Icon } from './Icon';
import { formatRupiah, parseNumberInput } from '../utils/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface PlanItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<FinancialPlanItem, 'id'>, existingId?: string) => void;
  editItem?: FinancialPlanItem | null;
  defaultGroup?: PlanGroupType;
  month: string;
}

export const PlanItemModal: React.FC<PlanItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  defaultGroup = 'fixed_cost',
  month,
}) => {
  const [group, setGroup] = useState<PlanGroupType>(defaultGroup);
  const [title, setTitle] = useState('');
  const [incomeType, setIncomeType] = useState<IncomeCategoryType>('Utama');
  const [priority, setPriority] = useState<PlanPriority>('High');
  const [rawPlanned, setRawPlanned] = useState('');
  const [rawActual, setRawActual] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setGroup(editItem.group);
      setTitle(editItem.title);
      setIncomeType(editItem.incomeType || 'Utama');
      setPriority(editItem.priority);
      setRawPlanned(editItem.plannedAmount > 0 ? editItem.plannedAmount.toString() : '');
      setRawActual(editItem.actualAmount > 0 ? editItem.actualAmount.toString() : '');
    } else {
      setGroup(defaultGroup);
      setTitle('');
      setIncomeType('Utama');
      setPriority('High');
      setRawPlanned('');
      setRawActual('');
    }
    setError('');
  }, [isOpen, editItem, defaultGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Keterangan / nama pos wajib diisi');
      return;
    }

    const planned = parseNumberInput(rawPlanned);
    const actual = parseNumberInput(rawActual);

    onSave(
      {
        month,
        group,
        title: title.trim(),
        incomeType: group === 'income' ? incomeType : undefined,
        priority,
        plannedAmount: planned,
        actualAmount: actual,
      },
      editItem?.id
    );

    onClose();
  };

  const plannedNum = parseNumberInput(rawPlanned);
  const actualNum = parseNumberInput(rawActual);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="layers" className="w-4 h-4" />
            </div>
            <DialogTitle>
              {editItem ? 'Ubah Pos Anggaran Bulanan' : 'Tambah Pos Anggaran Baru'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Kelompok Pos */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Kelompok Pos Keuangan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'income', label: 'Pendapatan' },
                { id: 'saving', label: 'Nabung & Investasi' },
                { id: 'fixed_cost', label: 'Pengeluaran Tetap' },
                { id: 'variable_cost', label: 'Pengeluaran Variabel' },
                { id: 'subscription_debt', label: 'Langganan & Hutang' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroup(g.id as PlanGroupType)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    group === g.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-foreground hover:bg-accent'
                  } ${g.id === 'subscription_debt' ? 'col-span-2' : ''}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan / Sumber */}
          <div>
            <label htmlFor="plan-title" className="block text-xs font-bold text-foreground mb-1.5">
              {group === 'income' ? 'Sumber Pendapatan' : 'Keterangan Pos'}
            </label>
            <Input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                group === 'income'
                  ? 'Contoh: Gaji Pokok, Bonus Kinerja, Side Job'
                  : group === 'saving'
                  ? 'Contoh: Dana Darurat, RDPU, Emas Antam'
                  : group === 'fixed_cost'
                  ? 'Contoh: Rumah / Ortu, Wifi, BBM Bensin'
                  : group === 'subscription_debt'
                  ? 'Contoh: Shopee PayLater, Paket Data, AI'
                  : 'Contoh: Belanja Bulanan, Keperluan Anak'
              }
              autoFocus
            />
          </div>

          {/* Tipe Khusus Income */}
          {group === 'income' && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Tipe Pendapatan
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Utama', 'Sampingan', 'Hutang', 'Lainnya'] as IncomeCategoryType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setIncomeType(t)}
                    className={`py-2 px-1 rounded-lg border text-xs font-semibold text-center transition-all ${
                      incomeType === t
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prioritas (Non-income) */}
          {group !== 'income' && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['High', 'Medium', 'Low'] as PlanPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                      priority === p
                        ? p === 'High'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : p === 'Medium'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rencana vs Realisasi Nominal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan-target" className="block text-xs font-bold text-foreground mb-1.5">
                Rencana (Budget)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="plan-target"
                  type="text"
                  inputMode="numeric"
                  value={plannedNum > 0 ? formatRupiah(plannedNum, false) : ''}
                  onChange={(e) => {
                    const num = parseNumberInput(e.target.value);
                    setRawPlanned(num === 0 ? '' : num.toString());
                  }}
                  placeholder="0"
                  className="pl-9 font-semibold tabular-nums"
                />
              </div>
            </div>

            <div>
              <label htmlFor="plan-actual" className="block text-xs font-bold text-foreground mb-1.5">
                Realisasi (Aktual)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="plan-actual"
                  type="text"
                  inputMode="numeric"
                  value={actualNum > 0 ? formatRupiah(actualNum, false) : ''}
                  onChange={(e) => {
                    const num = parseNumberInput(e.target.value);
                    setRawActual(num === 0 ? '' : num.toString());
                  }}
                  placeholder="0"
                  className="pl-9 font-semibold tabular-nums"
                />
              </div>
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
              {editItem ? 'Simpan Perubahan' : 'Tambah Pos'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
