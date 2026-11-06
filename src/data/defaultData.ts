import { Category, Wallet, Transaction, Budget, FinancialPlanItem, DailyExpenseItem, JajanItem } from '../types';
import { getCurrentMonthString } from '../utils/currency';

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran
  { id: 'cat-food', name: 'Makanan & Minuman', type: 'expense', icon: 'utensils', color: '#f97316' },
  { id: 'cat-transport', name: 'Transportasi', type: 'expense', icon: 'car', color: '#3b82f6' },
  { id: 'cat-shopping', name: 'Belanja Harian', type: 'expense', icon: 'shopping-bag', color: '#ec4899' },
  { id: 'cat-bills', name: 'Tagihan & Listrik', type: 'expense', icon: 'file-text', color: '#8b5cf6' },
  { id: 'cat-fun', name: 'Hiburan & Nongkrong', type: 'expense', icon: 'film', color: '#14b8a6' },
  { id: 'cat-health', name: 'Kesehatan & Obat', type: 'expense', icon: 'heart', color: '#ef4444' },
  { id: 'cat-other-exp', name: 'Pengeluaran Lain', type: 'expense', icon: 'more-horizontal', color: '#64748b' },

  // Pemasukan
  { id: 'cat-salary', name: 'Gaji Bulanan', type: 'income', icon: 'briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Side Project / Freelance', type: 'income', icon: 'laptop', color: '#06b6d4' },
  { id: 'cat-investment', name: 'Hasil Investasi', type: 'income', icon: 'trending-up', color: '#84cc16' },
  { id: 'cat-other-inc', name: 'Pemasukan Lain', type: 'income', icon: 'dollar-sign', color: '#22c55e' },
];

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'w-cash',
    name: 'Dompet Tunai',
    type: 'cash',
    balance: 0,
    color: '#059669',
  },
  {
    id: 'w-bank',
    name: 'Rekening Bank',
    type: 'bank',
    balance: 0,
    color: '#1d4ed8',
  },
];

export function getDefaultTransactions(): Transaction[] {
  return [];
}

export function getDefaultBudgets(): Budget[] {
  return [];
}

export function getDefaultPlans(_month: string = getCurrentMonthString()): FinancialPlanItem[] {
  return [];
}

export function getDefaultDailyExpenses(_month: string = getCurrentMonthString()): DailyExpenseItem[] {
  return [];
}

export function getDefaultJajanItems(_month: string = getCurrentMonthString()): JajanItem[] {
  return [];
}
