import { Category, Wallet, Transaction, Budget } from '../types';
import { getCurrentMonthString, getTodayString } from '../utils/currency';

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
    balance: 450000,
    color: '#059669',
  },
  {
    id: 'w-bca',
    name: 'BCA Utama',
    type: 'bank',
    balance: 5200000,
    color: '#1d4ed8',
    accountNumber: '8820-1290-41',
  },
  {
    id: 'w-gopay',
    name: 'GoPay',
    type: 'ewallet',
    balance: 245000,
    color: '#0284c7',
  },
];

export function getDefaultTransactions(): Transaction[] {
  const today = getTodayString();
  const [year, month, dayStr] = today.split('-');
  const day = parseInt(dayStr, 10);
  
  // Format tanggal mundur sedikit untuk sampel data bulan ini
  const d1 = today;
  const d2 = `${year}-${month}-${String(Math.max(1, day - 1)).padStart(2, '0')}`;
  const d3 = `${year}-${month}-${String(Math.max(1, day - 3)).padStart(2, '0')}`;
  const d4 = `${year}-${month}-${String(Math.max(1, day - 5)).padStart(2, '0')}`;

  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 6500000,
      categoryId: 'cat-salary',
      walletId: 'w-bca',
      date: d4,
      note: 'Gaji masuk bulan ini',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 45000,
      categoryId: 'cat-food',
      walletId: 'w-gopay',
      date: d1,
      note: 'Makan siang nasi padang',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 25000,
      categoryId: 'cat-transport',
      walletId: 'w-cash',
      date: d2,
      note: 'Bensin motor pertalite',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 175000,
      categoryId: 'cat-shopping',
      walletId: 'w-bca',
      date: d3,
      note: 'Belanja sabun dan kebutuhan kos',
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 350000,
      categoryId: 'cat-bills',
      walletId: 'w-bca',
      date: d4,
      note: 'Token listrik PLN bulanan',
      createdAt: Date.now() - 5 * 86400000,
    },
  ];
}

export function getDefaultBudgets(): Budget[] {
  const currentMonth = getCurrentMonthString();
  return [
    {
      id: 'b-1',
      categoryId: 'cat-food',
      monthlyLimit: 1200000,
      month: currentMonth,
    },
    {
      id: 'b-2',
      categoryId: 'cat-transport',
      monthlyLimit: 400000,
      month: currentMonth,
    },
    {
      id: 'b-3',
      categoryId: 'cat-shopping',
      monthlyLimit: 600000,
      month: currentMonth,
    },
    {
      id: 'b-4',
      categoryId: 'cat-bills',
      monthlyLimit: 500000,
      month: currentMonth,
    },
  ];
}

import { FinancialPlanItem, DailyExpenseItem, JajanItem } from '../types';

export function getDefaultPlans(month: string = getCurrentMonthString()): FinancialPlanItem[] {
  return [
    // 1. Pendapatan / Income
    {
      id: 'plan-inc-1',
      month,
      group: 'income',
      title: 'Gaji Bulanan',
      incomeType: 'Utama',
      priority: 'High',
      plannedAmount: 7200000,
      actualAmount: 7200000,
    },
    {
      id: 'plan-inc-2',
      month,
      group: 'income',
      title: 'Side Job / Freelance',
      incomeType: 'Sampingan',
      priority: 'Medium',
      plannedAmount: 200000,
      actualAmount: 200000,
    },
    {
      id: 'plan-inc-3',
      month,
      group: 'income',
      title: 'Pelunasan Piutang Teman',
      incomeType: 'Hutang',
      priority: 'Low',
      plannedAmount: 180000,
      actualAmount: 180000,
    },

    // 2. Nabung / Saving & Investasi
    {
      id: 'plan-sav-1',
      month,
      group: 'saving',
      title: 'Dana Darurat (Bank / RDPU)',
      priority: 'High',
      plannedAmount: 3000000,
      actualAmount: 3000000,
    },
    {
      id: 'plan-sav-2',
      month,
      group: 'saving',
      title: 'Tabungan Dingin & Emas',
      priority: 'High',
      plannedAmount: 1000000,
      actualAmount: 1000000,
    },

    // 3. Pengeluaran Tetap / Fixed Cost
    {
      id: 'plan-fix-1',
      month,
      group: 'fixed_cost',
      title: 'Ortu / Uang Rumah',
      priority: 'High',
      plannedAmount: 700000,
      actualAmount: 750000,
    },
    {
      id: 'plan-fix-2',
      month,
      group: 'fixed_cost',
      title: 'Internet Wifi Rumah',
      priority: 'High',
      plannedAmount: 215000,
      actualAmount: 215000,
    },
    {
      id: 'plan-fix-3',
      month,
      group: 'fixed_cost',
      title: 'BBM Mingguan (Bensin)',
      priority: 'High',
      plannedAmount: 130000,
      actualAmount: 123000,
    },

    // 4. Pengeluaran Tidak Tetap / Variable Cost
    {
      id: 'plan-var-1',
      month,
      group: 'variable_cost',
      title: 'Total Biaya Jajan & Nongkrong Bulan ini',
      priority: 'High',
      plannedAmount: 500000,
      actualAmount: 714000,
      isAutoCalculated: true,
    },
    {
      id: 'plan-var-2',
      month,
      group: 'variable_cost',
      title: 'Total Pengeluaran Sehari-Hari Bulan ini',
      priority: 'High',
      plannedAmount: 400000,
      actualAmount: 329000,
      isAutoCalculated: true,
    },

    // 5. Biaya Langganan & Hutang / Subscription & Debt
    {
      id: 'plan-sub-1',
      month,
      group: 'subscription_debt',
      title: 'Shopee PayLater / Cicilan',
      priority: 'High',
      plannedAmount: 408567,
      actualAmount: 408567,
    },
    {
      id: 'plan-sub-2',
      month,
      group: 'subscription_debt',
      title: 'Paket Data Kuota HP',
      priority: 'High',
      plannedAmount: 40000,
      actualAmount: 40000,
    },
    {
      id: 'plan-sub-3',
      month,
      group: 'subscription_debt',
      title: 'Langganan ChatGPT / AI',
      priority: 'Medium',
      plannedAmount: 30000,
      actualAmount: 30000,
    },
  ];
}

export function getDefaultDailyExpenses(month: string = getCurrentMonthString()): DailyExpenseItem[] {
  const ym = month;

  return [
    {
      id: 'de-1',
      month: ym,
      date: `${ym}-10`,
      title: 'Kopi Kenangan (2 cup)',
      quantity: 2,
      price: 19000,
      total: 38000,
      walletId: 'w-gopay',
      createdAt: Date.now() - 4000000,
    },
    {
      id: 'de-2',
      month: ym,
      date: `${ym}-10`,
      title: 'Air Mineral Le Minerale',
      quantity: 1,
      price: 3000,
      total: 3000,
      walletId: 'w-cash',
      createdAt: Date.now() - 3500000,
    },
    {
      id: 'de-3',
      month: ym,
      date: `${ym}-12`,
      title: 'Gorengan Bakwan & Tahu',
      quantity: 2,
      price: 5000,
      total: 10000,
      walletId: 'w-cash',
      createdAt: Date.now() - 3000000,
    },
    {
      id: 'de-4',
      month: ym,
      date: `${ym}-13`,
      title: 'Risoles Mayo',
      quantity: 2,
      price: 3000,
      total: 6000,
      walletId: 'w-cash',
      createdAt: Date.now() - 2500000,
    },
    {
      id: 'de-5',
      month: ym,
      date: `${ym}-16`,
      title: 'Mie Gacoan Level 2',
      quantity: 1,
      price: 16000,
      total: 16000,
      walletId: 'w-gopay',
      createdAt: Date.now() - 2000000,
    },
    {
      id: 'de-6',
      month: ym,
      date: `${ym}-17`,
      title: 'Ojek Online Gojek',
      quantity: 2,
      price: 20000,
      total: 40000,
      walletId: 'w-gopay',
      createdAt: Date.now() - 1500000,
    },
    {
      id: 'de-7',
      month: ym,
      date: `${ym}-25`,
      title: 'Ayam Geprek Sambal Bawang',
      quantity: 1,
      price: 15000,
      total: 15000,
      walletId: 'w-cash',
      createdAt: Date.now() - 1000000,
    },
    {
      id: 'de-8',
      month: ym,
      date: `${ym}-28`,
      title: 'Bensin Motor Pertalite (3 Liter)',
      quantity: 3,
      price: 10000,
      total: 30000,
      walletId: 'w-cash',
      createdAt: Date.now() - 500000,
    },
  ];
}

export function getDefaultJajanItems(month: string = getCurrentMonthString()): JajanItem[] {
  const ym = month;

  return [
    {
      id: 'jj-1',
      month: ym,
      date: `${ym}-10`,
      title: 'Sushi Tei / Sushi Box',
      amount: 231000,
      note: 'Makan sushi bareng teman kantor',
      walletId: 'w-bca',
      createdAt: Date.now() - 3800000,
    },
    {
      id: 'jj-2',
      month: ym,
      date: `${ym}-14`,
      title: 'Makan di Luar Cafe',
      amount: 117000,
      note: 'Nongkrong ngopi dan pasta',
      walletId: 'w-bca',
      createdAt: Date.now() - 3200000,
    },
    {
      id: 'jj-3',
      month: ym,
      date: `${ym}-17`,
      title: 'Golden Lamian',
      amount: 50000,
      note: 'Lamian spicy soup',
      walletId: 'w-gopay',
      createdAt: Date.now() - 2400000,
    },
    {
      id: 'jj-4',
      month: ym,
      date: `${ym}-17`,
      title: 'Games / Hiburan',
      amount: 100000,
      note: 'Top up game akhir pekan',
      walletId: 'w-gopay',
      createdAt: Date.now() - 2200000,
    },
    {
      id: 'jj-5',
      month: ym,
      date: `${ym}-22`,
      title: 'Billiard 1 Jam',
      amount: 30000,
      note: 'Main billiard santai',
      walletId: 'w-cash',
      createdAt: Date.now() - 1800000,
    },
    {
      id: 'jj-6',
      month: ym,
      date: `${ym}-23`,
      title: 'Potong Rambut Barbershop',
      amount: 45000,
      note: 'Haircut bulanan',
      walletId: 'w-cash',
      createdAt: Date.now() - 1200000,
    },
    {
      id: 'jj-7',
      month: ym,
      date: `${ym}-30`,
      title: 'Richeese Factory Combo',
      amount: 105000,
      note: 'Fire chicken level 3 bareng keluarga',
      walletId: 'w-gopay',
      createdAt: Date.now() - 600000,
    },
    {
      id: 'jj-8',
      month: ym,
      date: `${ym}-25`,
      title: 'Jajan Gorengan & Es Kelapa',
      amount: 5000,
      note: 'Camilan sore',
      walletId: 'w-cash',
      createdAt: Date.now() - 300000,
    },
  ];
}
