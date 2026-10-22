/**
 * Utility pemformatan Rupiah dan tanggal untuk Duit Gua
 */

export function formatRupiah(amount: number, showPrefix: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(absAmount);

  const prefix = showPrefix ? 'Rp ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

export function formatCompactRupiah(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  
  let formatted = '';
  if (abs >= 1_000_000_000) {
    formatted = `${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  } else if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(0)} Rb`;
  } else {
    formatted = abs.toString();
  }

  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function parseNumberInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const today = new Date();
    const isToday = 
      today.getFullYear() === year &&
      today.getMonth() === month - 1 &&
      today.getDate() === day;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = 
      yesterday.getFullYear() === year &&
      yesterday.getMonth() === month - 1 &&
      yesterday.getDate() === day;

    if (isToday) return 'Hari ini';
    if (isYesterday) return 'Kemarin';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    return `${day} ${months[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthIndo(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (month >= 1 && month <= 12) {
      return `${months[month - 1]} ${year}`;
    }
    return monthStr;
  } catch {
    return monthStr;
  }
}

export function getPrevMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  } catch {
    return monthStr;
  }
}

export function getNextMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
  } catch {
    return monthStr;
  }
}
