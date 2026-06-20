'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FALLBACK_RATES } from '@/lib/constants';
import { convert, fmt as fmtFn, fmtNative as fmtNativeFn, type Rates } from '@/lib/currency';
import type { UserRole } from '@/lib/permissions';

interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
}

interface AppContextValue {
  // Auth
  user: UserProfile | null;
  // Currency
  displayCurrency: string;
  setDisplayCurrency: (c: string) => void;
  rates: Rates;
  ratesLive: boolean;
  // Helpers
  convert: (amount: number, from: string) => number;
  fmt: (amount: number, from: string) => string;
  fmtNative: (amount: number, cur: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialProfile }: {
  children: React.ReactNode;
  initialProfile: UserProfile | null;
}) {
  const [user] = useState<UserProfile | null>(initialProfile);
  const [displayCurrency, setDisplayCurrencyState] = useState('USD');
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);

  // Persist display currency
  const setDisplayCurrency = useCallback((c: string) => {
    setDisplayCurrencyState(c);
    localStorage.setItem('mg_display_currency', c);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('mg_display_currency');
    if (saved) setDisplayCurrencyState(saved);

    // Fetch live rates via our proxy route
    fetch('/api/rates')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates(data.rates);
          setRatesLive(data.live ?? false);
        }
      })
      .catch(() => {});
  }, []);

  const ctxConvert = useCallback(
    (amount: number, from: string) => convert(amount, from, displayCurrency, rates),
    [displayCurrency, rates],
  );
  const ctxFmt = useCallback(
    (amount: number, from: string) => fmtFn(amount, from, displayCurrency, rates),
    [displayCurrency, rates],
  );
  const ctxFmtNative = useCallback(fmtNativeFn, []);

  return (
    <AppContext.Provider value={{
      user,
      displayCurrency,
      setDisplayCurrency,
      rates,
      ratesLive,
      convert: ctxConvert,
      fmt: ctxFmt,
      fmtNative: ctxFmtNative,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// Convenience: sign out
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}
