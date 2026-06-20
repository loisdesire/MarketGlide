import { CURRENCIES, FALLBACK_RATES } from './constants';

export type Rates = Record<string, number>;

export function convert(
  amount: number,
  fromCur: string,
  toCur: string,
  rates: Rates,
): number {
  if (!amount || fromCur === toCur) return amount || 0;
  const usd = amount / (rates[fromCur] ?? 1);
  return usd * (rates[toCur] ?? 1);
}

export function fmt(
  amount: number,
  fromCur: string,
  toCur: string,
  rates: Rates,
): string {
  const val = convert(amount ?? 0, fromCur, toCur, rates);
  const sym = (CURRENCIES[toCur] ?? CURRENCIES.USD).symbol;
  return sym + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtNative(amount: number, cur: string): string {
  const sym = (CURRENCIES[cur] ?? CURRENCIES.USD).symbol;
  return sym + (amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function fetchRates(): Promise<{ rates: Rates; live: boolean }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data?.rates) {
      const rates: Rates = { USD: 1 };
      Object.keys(CURRENCIES).forEach(c => {
        if (data.rates[c]) rates[c] = data.rates[c];
      });
      return { rates: { ...FALLBACK_RATES, ...rates }, live: true };
    }
  } catch { /* fall through */ }
  return { rates: FALLBACK_RATES, live: false };
}
