import { AppState } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_WALLETS,
  getDefaultTransactions,
  getDefaultBudgets,
  getDefaultPlans,
  getDefaultDailyExpenses,
  getDefaultJajanItems,
} from '../data/defaultData';
import { getCurrentMonthString } from './currency';

const STORAGE_KEY = 'duit_gua_data_v2';

export function getInitialState(): AppState {
  const currentMonth = getCurrentMonthString();

  if (typeof window === 'undefined') {
    return {
      wallets: DEFAULT_WALLETS,
      categories: DEFAULT_CATEGORIES,
      transactions: getDefaultTransactions(),
      budgets: getDefaultBudgets(),
      plans: getDefaultPlans(currentMonth),
      dailyExpenses: getDefaultDailyExpenses(currentMonth),
      jajanItems: getDefaultJajanItems(currentMonth),
      selectedMonth: currentMonth,
      theme: 'light',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('duit_gua_data_v1');
    if (!raw) {
      const initial: AppState = {
        wallets: DEFAULT_WALLETS,
        categories: DEFAULT_CATEGORIES,
        transactions: getDefaultTransactions(),
        budgets: getDefaultBudgets(),
        plans: getDefaultPlans(currentMonth),
        dailyExpenses: getDefaultDailyExpenses(currentMonth),
        jajanItems: getDefaultJajanItems(currentMonth),
        selectedMonth: currentMonth,
        theme: 'light',
      };
      saveState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    return {
      wallets: Array.isArray(parsed.wallets) && parsed.wallets.length > 0 ? parsed.wallets : DEFAULT_WALLETS,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : getDefaultTransactions(),
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : getDefaultBudgets(),
      plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : getDefaultPlans(currentMonth),
      dailyExpenses: Array.isArray(parsed.dailyExpenses) && parsed.dailyExpenses.length > 0 ? parsed.dailyExpenses : getDefaultDailyExpenses(currentMonth),
      jajanItems: Array.isArray(parsed.jajanItems) && parsed.jajanItems.length > 0 ? parsed.jajanItems : getDefaultJajanItems(currentMonth),
      selectedMonth: parsed.selectedMonth || currentMonth,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch (err) {
    console.error('Gagal membaca data dari LocalStorage:', err);
    return {
      wallets: DEFAULT_WALLETS,
      categories: DEFAULT_CATEGORIES,
      transactions: getDefaultTransactions(),
      budgets: getDefaultBudgets(),
      plans: getDefaultPlans(currentMonth),
      dailyExpenses: getDefaultDailyExpenses(currentMonth),
      jajanItems: getDefaultJajanItems(currentMonth),
      selectedMonth: currentMonth,
      theme: 'light',
    };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Gagal menyimpan data ke LocalStorage:', err);
  }
}

export function exportDataAsJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `duit-gua-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDataFromJSON(jsonText: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') return null;

    if (!Array.isArray(parsed.wallets) || !Array.isArray(parsed.transactions)) {
      return null;
    }

    const currentMonth = getCurrentMonthString();
    const state: AppState = {
      wallets: parsed.wallets,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: parsed.transactions,
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      plans: Array.isArray(parsed.plans) ? parsed.plans : getDefaultPlans(currentMonth),
      dailyExpenses: Array.isArray(parsed.dailyExpenses) ? parsed.dailyExpenses : [],
      jajanItems: Array.isArray(parsed.jajanItems) ? parsed.jajanItems : [],
      selectedMonth: parsed.selectedMonth || currentMonth,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };

    saveState(state);
    return state;
  } catch (err) {
    console.error('Gagal import data:', err);
    return null;
  }
}

export function clearAllData(): AppState {
  const currentMonth = getCurrentMonthString();
  const blankState: AppState = {
    wallets: [
      { id: 'w-cash', name: 'Dompet Tunai', type: 'cash', balance: 0, color: '#059669' },
      { id: 'w-bca', name: 'Rekening Bank', type: 'bank', balance: 0, color: '#1d4ed8' },
    ],
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: [],
    plans: [],
    dailyExpenses: [],
    jajanItems: [],
    selectedMonth: currentMonth,
    theme: 'light',
  };
  saveState(blankState);
  return blankState;
}
