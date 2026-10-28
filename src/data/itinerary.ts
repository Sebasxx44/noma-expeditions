import type { DestinationId, ExpeditionSelection } from '@/types';

export const calculateTotal = (rate: number, days: number, travelers: number): number => Math.round(rate * days * travelers);
export const formatMoney = (amount: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
export const clampInteger = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, Number.isFinite(value) ? Math.round(value) : min));
export const todayISO = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export const validDeparture = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO()) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isFinite(parsed.getTime()) && parsed.getFullYear() === Number(date.slice(0, 4)) && parsed.getMonth() + 1 === Number(date.slice(5, 7)) && parsed.getDate() === Number(date.slice(8, 10));
};

export const getDepartureError = (date: string): string => date === '' || validDeparture(date) ? '' : 'Choose today or a future date, or clear the field for flexible dates.';

export const defaultSelection: ExpeditionSelection = { destinationId: 'patagonia', date: '', travelers: 2, days: 8 };
const isDestinationId = (id: string): id is DestinationId => id === 'patagonia' || id === 'dolomites' || id === 'iceland';
export const restoreSelection = (raw: string | null): ExpeditionSelection => {
  try {
    const stored = JSON.parse(raw ?? 'null') as Partial<ExpeditionSelection> | null;
    if (!stored || typeof stored !== 'object' || Array.isArray(stored) || typeof stored.destinationId !== 'string' || !isDestinationId(stored.destinationId)) return { ...defaultSelection };
    return {
      destinationId: stored.destinationId,
      date: typeof stored.date === 'string' && validDeparture(stored.date) ? stored.date : '',
      travelers: clampInteger(typeof stored.travelers === 'number' ? stored.travelers : 2, 1, 8),
      days: clampInteger(typeof stored.days === 'number' ? stored.days : 8, 4, 14),
    };
  } catch { return { ...defaultSelection }; }
};
