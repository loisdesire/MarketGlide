import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_RATES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: cache } = await admin.from('exchange_rate_cache').select('*').eq('id', 1).single();

  // Serve cached rates if they are < 1 hour old
  if (cache?.rates && cache.fetched_at) {
    const age = Date.now() - new Date(cache.fetched_at).getTime();
    if (age < 3600_000) {
      return NextResponse.json({ rates: cache.rates, live: true, cached: true });
    }
  }

  // Fetch fresh from Open Exchange Rates
  const appId = process.env.OPENEXCHANGERATES_APP_ID;
  if (appId) {
    try {
      const res  = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
      const data = await res.json();
      if (data?.rates) {
        const rates: Record<string, number> = { USD: 1 };
        Object.keys(FALLBACK_RATES).forEach(c => { if (data.rates[c]) rates[c] = data.rates[c]; });
        await admin.from('exchange_rate_cache').upsert({ id: 1, rates, fetched_at: new Date().toISOString() });
        return NextResponse.json({ rates, live: true });
      }
    } catch { /* fall through */ }
  }

  return NextResponse.json({ rates: FALLBACK_RATES, live: false });
}
