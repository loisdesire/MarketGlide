'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────
interface CartonRow {
  id: number;
  unitWeight: string;
  qty: string;
  l: string;
  w: string;
  h: string;
  cartons: string;
}

interface OtherCosts {
  clearing: string;
  portCharges: string;
  inspection: string;
  localDelivery: string;
  storage: string;
  docFees: string;
  misc: string;
}

type RatesStatus = 'loading' | 'live' | 'stale' | 'error';

// ── Constants ────────────────────────────────────────────────────
const CURRENCIES: Record<string, { name: string; symbol: string }> = {
  AED: { name: 'UAE Dirham',            symbol: 'AED ' },
  AUD: { name: 'Australian Dollar',     symbol: 'A$'   },
  BDT: { name: 'Bangladeshi Taka',      symbol: '৳'    },
  BRL: { name: 'Brazilian Real',        symbol: 'R$'   },
  CAD: { name: 'Canadian Dollar',       symbol: 'CA$'  },
  CNY: { name: 'Chinese Yuan',          symbol: '¥'    },
  EGP: { name: 'Egyptian Pound',        symbol: 'E£'   },
  ETB: { name: 'Ethiopian Birr',        symbol: 'Br'   },
  EUR: { name: 'Euro',                  symbol: '€'    },
  GBP: { name: 'British Pound',         symbol: '£'    },
  GHS: { name: 'Ghanaian Cedi',         symbol: 'GH₵'  },
  HKD: { name: 'Hong Kong Dollar',      symbol: 'HK$'  },
  IDR: { name: 'Indonesian Rupiah',     symbol: 'Rp'   },
  INR: { name: 'Indian Rupee',          symbol: '₹'    },
  JPY: { name: 'Japanese Yen',          symbol: '¥'    },
  KES: { name: 'Kenyan Shilling',       symbol: 'KSh'  },
  KWD: { name: 'Kuwaiti Dinar',         symbol: 'KD'   },
  MAD: { name: 'Moroccan Dirham',       symbol: 'DH'   },
  MXN: { name: 'Mexican Peso',          symbol: 'MX$'  },
  MYR: { name: 'Malaysian Ringgit',     symbol: 'RM'   },
  NGN: { name: 'Nigerian Naira',        symbol: '₦'    },
  PHP: { name: 'Philippine Peso',       symbol: '₱'    },
  PKR: { name: 'Pakistani Rupee',       symbol: '₨'    },
  QAR: { name: 'Qatari Riyal',          symbol: 'QR'   },
  RWF: { name: 'Rwandan Franc',         symbol: 'RF'   },
  SAR: { name: 'Saudi Riyal',           symbol: 'SR'   },
  SGD: { name: 'Singapore Dollar',      symbol: 'S$'   },
  THB: { name: 'Thai Baht',             symbol: '฿'    },
  TRY: { name: 'Turkish Lira',          symbol: '₺'    },
  TZS: { name: 'Tanzanian Shilling',    symbol: 'TSh'  },
  UGX: { name: 'Ugandan Shilling',      symbol: 'USh'  },
  USD: { name: 'US Dollar',             symbol: '$'    },
  VND: { name: 'Vietnamese Dong',       symbol: '₫'    },
  XOF: { name: 'West African CFA',      symbol: 'CFA'  },
  ZAR: { name: 'South African Rand',    symbol: 'R'    },
  ZMW: { name: 'Zambian Kwacha',        symbol: 'ZK'   },
};

const POPULAR_FIRST = ['USD', 'NGN', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'CNY', 'AED', 'INR', 'SAR', 'HKD'];

const CURRENCY_ORDER = [
  ...POPULAR_FIRST,
  ...Object.keys(CURRENCIES).filter(c => !POPULAR_FIRST.includes(c)).sort(),
];

const FALLBACK_RATES: Record<string, number> = {
  AED: 3.67,  AUD: 1.55,  BDT: 110,   BRL: 5.82,  CAD: 1.38,
  CNY: 7.25,  EGP: 49.5,  ETB: 56.5,  EUR: 0.92,  GBP: 0.79,
  GHS: 14.8,  HKD: 7.82,  IDR: 15800, INR: 84.3,  JPY: 151,
  KES: 129,   KWD: 0.307, MAD: 10.2,  MXN: 17.2,  MYR: 4.45,
  NGN: 1530,  PHP: 56.5,  PKR: 278,   QAR: 3.64,  RWF: 1290,
  SAR: 3.75,  SGD: 1.35,  THB: 34.8,  TRY: 33,    TZS: 2550,
  UGX: 3750,  USD: 1,     VND: 25000, XOF: 610,   ZAR: 18.2,
  ZMW: 26.5,
};

// ── Helpers ──────────────────────────────────────────────────────
function n(v: string): number { return parseFloat(v) || 0; }

function fmt(num: number, dec = 2): string {
  return num.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function money(num: number, code: string): string {
  const sym = CURRENCIES[code]?.symbol ?? `${code} `;
  return `${sym}${fmt(num)}`;
}

function getRate(rates: Record<string, number>, from: string, to: string): number {
  return (rates[to] ?? 1) / (rates[from] ?? 1);
}

// ── Component ────────────────────────────────────────────────────
export default function ShippingCalculatorPage() {
  // Base currency
  const [baseCcy, setBaseCcy] = useState('USD');
  const prevCcy = useRef('USD');

  // Rates
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('loading');
  const [ratesTime, setRatesTime] = useState('');

  // Shipment info
  const [shipId, setShipId] = useState('SHP-001');
  const [shipDate, setShipDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [origin, setOrigin] = useState('China');
  const [destination, setDestination] = useState('');
  const [shipMethod, setShipMethod] = useState('air');
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');

  // Product cost
  const [qty, setQty] = useState('100');
  const [unitCost, setUnitCost] = useState('5.00');

  // Carton rows
  const nextId = useRef(2);
  const [rows, setRows] = useState<CartonRow[]>([
    { id: 1, unitWeight: '0.05', qty: '100', l: '40', w: '30', h: '25', cartons: '1' },
  ]);
  const [volDiv, setVolDiv] = useState('6000');

  // Freight
  const [freightRate, setFreightRate] = useState('6.50');

  // Customs
  const [insurance, setInsurance] = useState('0');
  const [dutyRate, setDutyRate] = useState('20');
  const [vatRate, setVatRate] = useState('7.5');

  // Other costs
  const [other, setOther] = useState<OtherCosts>({
    clearing: '0', portCharges: '0', inspection: '0',
    localDelivery: '0', storage: '0', docFees: '0', misc: '0',
  });

  // Selling price
  const [sellPrice, setSellPrice] = useState('15.00');

  // Currency converter
  const [fxAmt, setFxAmt] = useState('100');
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('NGN');

  // ── Rate fetching ─────────────────────────────────────────────
  const fetchRates = useCallback(async () => {
    setRatesStatus('loading');

    try {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json() as { rates?: Record<string, number>; live?: boolean };
        const r = data.rates;
        if (r && Object.keys(r).length > 3) {
          setRates(prev => ({ ...prev, ...r }));
          setRatesTime(new Date().toLocaleTimeString());
          setRatesStatus(data.live ? 'live' : 'stale');
          return;
        }
      }
    } catch { /* fall through */ }

    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json() as { rates?: Record<string, number> };
        const r = data.rates;
        if (r && Object.keys(r).length > 10) {
          setRates(prev => ({ ...prev, ...r, USD: 1 }));
          setRatesTime(new Date().toLocaleTimeString());
          setRatesStatus('live');
          return;
        }
      }
    } catch { /* try next */ }

    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (res.ok) {
        const data = await res.json() as { rates?: Record<string, number> };
        const r = data.rates;
        if (r && Object.keys(r).length > 5) {
          setRates(prev => ({ ...prev, USD: 1, ...r }));
          setRatesTime(new Date().toLocaleTimeString());
          setRatesStatus('live');
          return;
        }
      }
    } catch { /* fall through */ }

    setRatesStatus('error');
  }, []);

  useEffect(() => { void fetchRates(); }, [fetchRates]);

  // ── Computed values ───────────────────────────────────────────
  const quantity = n(qty);
  const totalProduct = quantity * n(unitCost);

  const divisor = n(volDiv) || 6000;
  const rowCalcs: { actual: number; vol: number }[] = [];
  let totalActual = 0;
  let totalVol = 0;
  for (const row of rows) {
    const actual = n(row.unitWeight) * n(row.qty);
    const vol = (n(row.l) * n(row.w) * n(row.h) * n(row.cartons)) / divisor;
    totalActual += actual;
    totalVol += vol;
    rowCalcs.push({ actual, vol });
  }

  const chargeable = Math.max(totalActual, totalVol);
  const actualWins = totalActual >= totalVol;
  const freightCost = chargeable * n(freightRate);
  const insuranceN = n(insurance);
  const cif = totalProduct + freightCost + insuranceN;
  const duty = cif * (n(dutyRate) / 100);
  const vat = (cif + duty) * (n(vatRate) / 100);
  const otherTotal = Object.values(other).reduce((s, v) => s + n(v), 0);
  const totalLanded = totalProduct + freightCost + duty + vat + otherTotal;
  const unitLanded = quantity > 0 ? totalLanded / quantity : 0;
  const sp = n(sellPrice);
  const profitPerUnit = sp - unitLanded;
  const totalRevenue = sp * quantity;
  const totalProfit = profitPerUnit * quantity;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const fxRate = getRate(rates, fxFrom, fxTo);
  const fxResult = n(fxAmt) * fxRate;
  const crossRate = getRate(rates, baseCcy, fxTo);

  // ── Handlers ─────────────────────────────────────────────────
  function changeCcy(newCcy: string) {
    if (newCcy !== prevCcy.current) {
      const rate = getRate(rates, prevCcy.current, newCcy);
      const conv = (v: string): string => (n(v) * rate).toFixed(2);
      setUnitCost(conv);
      setFreightRate(conv);
      setInsurance(conv);
      setSellPrice(conv);
      setOther(oc => Object.fromEntries(
        Object.entries(oc).map(([k, v]) => [k, conv(v)])
      ) as unknown as OtherCosts);
    }
    prevCcy.current = newCcy;
    setBaseCcy(newCcy);
  }

  function updateRow(id: number, field: keyof Omit<CartonRow, 'id'>, value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, {
      id: nextId.current++,
      unitWeight: '0.05', qty: '50', l: '40', w: '30', h: '25', cartons: '1',
    }]);
  }

  function removeRow(id: number) {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  }

  function setOtherField(key: keyof OtherCosts, val: string) {
    setOther(prev => ({ ...prev, [key]: val }));
  }

  // ── Render helpers ────────────────────────────────────────────
  const m = (v: number) => money(v, baseCcy);
  const marginCls = margin >= 100 ? 'good' : margin >= 50 ? 'ok' : 'bad';
  const dotCls = ratesStatus === 'live' ? 'live' : ratesStatus === 'error' ? 'error' : 'stale';
  const statusLabel =
    ratesStatus === 'live'  ? `Live rates · ${ratesTime}` :
    ratesStatus === 'stale' ? `Cached rates · ${ratesTime}` :
    ratesStatus === 'error' ? 'Offline, using estimates' :
    'Loading rates…';

  const OTHER_FIELDS: [string, keyof OtherCosts][] = [
    ['Clearing charges', 'clearing'],
    ['Port charges',     'portCharges'],
    ['Inspection fees',  'inspection'],
    ['Local delivery',   'localDelivery'],
    ['Storage fees',     'storage'],
    ['Documentation',    'docFees'],
    ['Miscellaneous',    'misc'],
  ];

  return (
    <>
      {/* ── Page hero ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--fd-navy)', color: '#fff', padding: '52px 0 40px' }}>
        <div className="fd-container">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fd-orange)', margin: '0 0 10px' }}>
            Mini Importation Mastery: Working Tool
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-.025em', lineHeight: 1.15 }}>
            Landed Cost &amp; Weight Calculator
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.68)', maxWidth: 600, lineHeight: 1.7, margin: '0 0 24px' }}>
            Work out chargeable weight, freight cost, customs &amp; duty, total landed cost,
            per-unit cost, and profit margin, in any currency you choose.
          </p>

          <div className="lcc-bccy-bar">
            <label htmlFor="baseCcy">Calculate in</label>
            <select
              id="baseCcy"
              value={baseCcy}
              onChange={e => changeCcy(e.target.value)}
            >
              {CURRENCY_ORDER.map(code => (
                <option key={code} value={code}>{code}: {CURRENCIES[code].name}</option>
              ))}
            </select>
            <span className={`lcc-status-dot ${dotCls}`} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{statusLabel}</span>
            <button className="lcc-refresh-btn" onClick={() => void fetchRates()}>
              ↻ Refresh rates
            </button>
          </div>
        </div>
      </section>

      <div className="lcc-wrap">
        <div className="lcc-grid">

          {/* ── Left column ──────────────────────────────────── */}
          <div>

            {/* 1 — Shipment details */}
            <div className="lcc-card">
              <h2><span className="lcc-num">1</span> Shipment &amp; product details</h2>
              <p className="lcc-desc">Reference info for this shipment. All cost fields are in <strong>{baseCcy}</strong>.</p>

              <div className="lcc-field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="lcc-field">
                  <label>Shipment ID</label>
                  <input type="text" value={shipId} onChange={e => setShipId(e.target.value)} placeholder="SHP-001" />
                </div>
                <div className="lcc-field">
                  <label>Date</label>
                  <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Supplier name</label>
                  <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. Zen Crown Hair" />
                </div>
              </div>

              <div className="lcc-field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="lcc-field">
                  <label>Origin country</label>
                  <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Destination</label>
                  <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Nigeria" />
                </div>
                <div className="lcc-field">
                  <label>Shipping method</label>
                  <select value={shipMethod} onChange={e => setShipMethod(e.target.value)}>
                    <option value="air">Air freight</option>
                    <option value="sea">Sea freight</option>
                    <option value="road">Road</option>
                    <option value="express">Express (DHL / FedEx)</option>
                  </select>
                </div>
              </div>

              <div className="lcc-field-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="lcc-field">
                  <label>Product name</label>
                  <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Beauty accessory set" />
                </div>
                <div className="lcc-field">
                  <label>SKU / code</label>
                  <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="optional" />
                </div>
              </div>

              <div className="lcc-field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="lcc-field">
                  <label>Quantity (units)</label>
                  <input type="number" value={qty} min="1" onChange={e => setQty(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Unit cost ({baseCcy})</label>
                  <input type="number" value={unitCost} min="0" step="0.01" onChange={e => setUnitCost(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Total product value</label>
                  <input type="text" value={m(totalProduct)} disabled />
                </div>
              </div>
            </div>

            {/* 2 — Weight calculations */}
            <div className="lcc-card">
              <h2><span className="lcc-num">2</span> Weight calculations</h2>
              <p className="lcc-desc">Add one row per carton size. The calculator determines actual, volumetric, and chargeable weight.</p>

              <div style={{ overflowX: 'auto' }}>
                <table className="lcc-table">
                  <thead>
                    <tr>
                      <th>Unit wt (kg)</th>
                      <th>Units/carton</th>
                      <th>L (cm)</th>
                      <th>W (cm)</th>
                      <th>H (cm)</th>
                      <th># Cartons</th>
                      <th style={{ textAlign: 'right' }}>Actual wt</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.id}>
                        {(['unitWeight', 'qty', 'l', 'w', 'h', 'cartons'] as const).map(f => (
                          <td key={f}>
                            <input
                              type="number"
                              value={row[f]}
                              min="0"
                              step={f === 'unitWeight' ? '0.001' : '1'}
                              onChange={e => updateRow(row.id, f, e.target.value)}
                            />
                          </td>
                        ))}
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                          {fmt(rowCalcs[idx]?.actual ?? 0)} kg
                        </td>
                        <td>
                          <button className="lcc-remove-btn" onClick={() => removeRow(row.id)} disabled={rows.length <= 1}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="lcc-add-row-btn" onClick={addRow}>+ Add carton row</button>

              <div className="lcc-field-row" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                <div className="lcc-field">
                  <label>Volumetric divisor</label>
                  <select value={volDiv} onChange={e => setVolDiv(e.target.value)}>
                    <option value="6000">6000 (standard air freight)</option>
                    <option value="5000">5000 (DHL / FedEx express)</option>
                    <option value="4000">4000 (some sea / road carriers)</option>
                  </select>
                </div>
              </div>

              <div className="lcc-formula">
                Volumetric weight (kg) = L × W × H × Cartons ÷ {volDiv}<br />
                Chargeable weight = MAX(total actual weight, total volumetric weight)
              </div>

              <div className="lcc-weight-boxes">
                <div className={`lcc-weight-box${actualWins && totalActual > 0 ? ' active' : ''}`}>
                  <div className="wb-l">Total actual weight</div>
                  <div className="wb-v">{fmt(totalActual)} kg</div>
                  {actualWins && totalActual > 0 && <div className="wb-tag">Billed as chargeable</div>}
                </div>
                <div className={`lcc-weight-box${!actualWins && totalVol > 0 ? ' active' : ''}`}>
                  <div className="wb-l">Total volumetric weight</div>
                  <div className="wb-v">{fmt(totalVol)} kg</div>
                  {!actualWins && totalVol > 0 && <div className="wb-tag">Billed as chargeable</div>}
                </div>
                <div className="lcc-weight-box winner">
                  <div className="wb-l">Chargeable weight</div>
                  <div className="wb-v">{fmt(chargeable)} kg</div>
                  {chargeable > 0 && <div className="wb-tag">{actualWins ? 'Actual applies' : 'Volumetric applies'}</div>}
                </div>
              </div>
            </div>

            {/* 3 — Freight */}
            <div className="lcc-card">
              <h2><span className="lcc-num">3</span> Freight cost</h2>
              <p className="lcc-desc">Enter your carrier&apos;s rate per kg. Chargeable weight is auto-filled from Section 2.</p>
              <div className="lcc-field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="lcc-field">
                  <label>Freight rate / kg ({baseCcy})</label>
                  <input type="number" value={freightRate} min="0" step="0.01" onChange={e => setFreightRate(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Chargeable weight</label>
                  <input type="text" value={`${fmt(chargeable)} kg`} disabled />
                </div>
                <div className="lcc-field">
                  <label>Total freight cost</label>
                  <input type="text" value={m(freightCost)} disabled />
                </div>
              </div>
              <div className="lcc-formula">Freight cost = Chargeable weight × Rate per kg</div>
            </div>

            {/* 4 — Customs & duty */}
            <div className="lcc-card">
              <h2><span className="lcc-num">4</span> Customs &amp; duty</h2>
              <p className="lcc-desc">CIF (Cost + Insurance + Freight) is the customs valuation base. Verify actual rates with your customs broker.</p>

              <div className="lcc-two-col">
                <div>
                  <div className="lcc-field" style={{ marginBottom: 10 }}>
                    <label>Insurance cost ({baseCcy})</label>
                    <input type="number" value={insurance} min="0" step="0.01" onChange={e => setInsurance(e.target.value)} />
                  </div>
                  <div className="lcc-formula">CIF = Product value + Freight + Insurance</div>
                  <div className="lcc-field" style={{ marginTop: 10 }}>
                    <label>CIF value (auto)</label>
                    <input type="text" value={m(cif)} disabled />
                  </div>
                </div>
                <div>
                  <div className="lcc-field" style={{ marginBottom: 10 }}>
                    <label>Import duty rate (%)</label>
                    <input type="number" value={dutyRate} min="0" step="0.1" onChange={e => setDutyRate(e.target.value)} />
                  </div>
                  <div className="lcc-formula">Duty = CIF × Duty %</div>
                  <div className="lcc-field" style={{ marginTop: 10 }}>
                    <label>Duty amount (auto)</label>
                    <input type="text" value={m(duty)} disabled />
                  </div>
                </div>
              </div>

              <div className="lcc-two-col" style={{ marginTop: 14 }}>
                <div>
                  <div className="lcc-field">
                    <label>VAT / GST rate (%)</label>
                    <input type="number" value={vatRate} min="0" step="0.1" onChange={e => setVatRate(e.target.value)} />
                  </div>
                  <div className="lcc-formula">VAT = (CIF + Duty) × VAT %</div>
                </div>
                <div>
                  <div className="lcc-field">
                    <label>VAT / GST amount (auto)</label>
                    <input type="text" value={m(vat)} disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* 5 — Other costs */}
            <div className="lcc-card">
              <h2>
                <span className="lcc-num">5</span> Other landing costs
                <span style={{ fontSize: 12.5, fontWeight: 400, color: 'var(--fd-muted)' }}>(in {baseCcy})</span>
              </h2>
              <p className="lcc-desc">Every fee between customs clearance and your warehouse.</p>
              <table className="lcc-other-table">
                <tbody>
                  {OTHER_FIELDS.map(([label, key]) => (
                    <tr key={key}>
                      <td>{label}</td>
                      <td>
                        <input
                          type="number"
                          value={other[key]}
                          min="0"
                          step="0.01"
                          onChange={e => setOtherField(key, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6 — Total landed */}
            <div className="lcc-card">
              <h2><span className="lcc-num">6</span> Total &amp; unit landed cost</h2>
              <div className="lcc-formula">
                Total landed = Product + Freight + Duty + VAT + Other charges<br />
                Unit landed cost = Total ÷ Quantity
              </div>
              <div className="lcc-field-row" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                <div className="lcc-field">
                  <label>Total landed cost</label>
                  <input type="text" value={m(totalLanded)} disabled style={{ fontSize: 16, fontWeight: 700 }} />
                </div>
                <div className="lcc-field">
                  <label>Unit landed cost</label>
                  <input type="text" value={m(unitLanded)} disabled style={{ fontSize: 16, fontWeight: 700 }} />
                </div>
              </div>
            </div>

            {/* 7 — Selling & profit */}
            <div className="lcc-card">
              <h2><span className="lcc-num">7</span> Selling price &amp; profit</h2>
              <p className="lcc-desc">Set your intended selling price per unit to see profit and margin.</p>
              <div className="lcc-field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="lcc-field">
                  <label>Selling price / unit ({baseCcy})</label>
                  <input type="number" value={sellPrice} min="0" step="0.01" onChange={e => setSellPrice(e.target.value)} />
                </div>
                <div className="lcc-field">
                  <label>Unit landed cost</label>
                  <input type="text" value={m(unitLanded)} disabled />
                </div>
                <div className="lcc-field">
                  <label>Profit per unit</label>
                  <input
                    type="text"
                    value={m(profitPerUnit)}
                    disabled
                    style={{ color: profitPerUnit >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}
                  />
                </div>
              </div>
              <div className="lcc-formula">
                Profit / unit = Selling price − Unit landed cost &nbsp;·&nbsp;
                Margin % = (Total profit ÷ Revenue) × 100
              </div>
            </div>

            {/* 8 — Currency converter */}
            <div className="lcc-card">
              <h2><span className="lcc-num">8</span> Currency converter</h2>
              <p className="lcc-desc" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Convert between any two currencies using {ratesStatus === 'live' ? 'live' : 'estimated'} rates.
                <span className={`lcc-live-chip${ratesStatus === 'live' ? '' : ratesStatus === 'error' ? ' error' : ' stale'}`}>
                  <span className="lcc-live-chip-dot" />
                  {ratesStatus === 'live' ? 'Live' : ratesStatus === 'error' ? 'Offline' : ratesStatus === 'loading' ? '…' : 'Cached'}
                </span>
              </p>

              <div className="lcc-swap-row">
                <div className="lcc-field">
                  <label>Amount</label>
                  <input type="number" value={fxAmt} min="0" step="0.01" onChange={e => setFxAmt(e.target.value)} />
                </div>
                <button
                  className="lcc-swap-btn"
                  onClick={() => { const t = fxFrom; setFxFrom(fxTo); setFxTo(t); }}
                  title="Swap currencies"
                >
                  ⇌
                </button>
                <div className="lcc-field">
                  <label>Converted</label>
                  <input type="text" value={`${fmt(fxResult)} ${fxTo}`} disabled />
                </div>
              </div>

              <div className="lcc-swap-row">
                <div className="lcc-field">
                  <label>From</label>
                  <select value={fxFrom} onChange={e => setFxFrom(e.target.value)}>
                    {CURRENCY_ORDER.map(c => (
                      <option key={c} value={c}>{c}: {CURRENCIES[c].name}</option>
                    ))}
                  </select>
                </div>
                <div />
                <div className="lcc-field">
                  <label>To</label>
                  <select value={fxTo} onChange={e => setFxTo(e.target.value)}>
                    {CURRENCY_ORDER.map(c => (
                      <option key={c} value={c}>{c}: {CURRENCIES[c].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--fd-muted)', margin: '4px 0 20px' }}>
                1 {fxFrom} = {fmt(fxRate, 4)} {fxTo}
                {ratesTime && <> · rates updated {ratesTime}</>}
              </p>

              <div style={{ borderTop: '1px solid var(--fd-border)', paddingTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fd-navy)', margin: '0 0 10px' }}>
                  Key shipment figures: {baseCcy} vs {fxTo}
                </p>
                <table className="lcc-fx-table">
                  <thead>
                    <tr>
                      <th>Figure</th>
                      <th>{baseCcy}</th>
                      <th>{fxTo}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ['Total product value', totalProduct],
                      ['Freight cost',        freightCost],
                      ['Duty + VAT',          duty + vat],
                      ['Total landed cost',   totalLanded],
                      ['Unit landed cost',    unitLanded],
                      ['Total profit',        totalProfit],
                    ] as [string, number][]).map(([label, val]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{fmt(val)}</td>
                        <td>{fmt(val * crossRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
              <button className="fd-btn fd-btn-primary" onClick={() => window.print()}>
                Print / Save as PDF
              </button>
            </div>

          </div>

          {/* ── Right column: sticky dashboard ───────────────── */}
          <div className="lcc-dash">
            <div className="lcc-dash-card">
              <h3>
                Shipment summary
                <span className="ccy-chip">{baseCcy}</span>
              </h3>
              {([
                ['Product value',      m(totalProduct)],
                ['Qty',                `${fmt(quantity, 0)} units`],
                ['Actual weight',      `${fmt(totalActual)} kg`],
                ['Volumetric weight',  `${fmt(totalVol)} kg`],
                ['Chargeable weight',  `${fmt(chargeable)} kg`],
                ['Freight cost',       m(freightCost)],
                ['CIF value',          m(cif)],
                ['Duty',               m(duty)],
                ['VAT / GST',          m(vat)],
                ['Other charges',      m(otherTotal)],
              ] as [string, string][]).map(([lbl, val]) => (
                <div className="lcc-row" key={lbl}>
                  <span className="rl">{lbl}</span>
                  <span className="rv">{val}</span>
                </div>
              ))}
              <div className="lcc-row total">
                <span className="rl">Total landed</span>
                <span className="rv">{m(totalLanded)}</span>
              </div>
              <div className="lcc-row">
                <span className="rl">Per unit</span>
                <span className="rv">{m(unitLanded)}</span>
              </div>
            </div>

            <div className="lcc-profit-card">
              <h3>
                Profitability
                <span className="ccy-chip">{baseCcy}</span>
              </h3>
              {([
                ['Selling price',     m(sp)],
                ['Unit landed cost',  m(unitLanded)],
                ['Profit / unit',     m(profitPerUnit)],
                ['Total revenue',     m(totalRevenue)],
                ['Total profit',      m(totalProfit)],
              ] as [string, string][]).map(([lbl, val]) => (
                <div className="lcc-profit-row" key={lbl}>
                  <span className="pl">{lbl}</span>
                  <span
                    className="pv"
                    style={{ color: lbl === 'Profit / unit' && profitPerUnit < 0 ? '#dc2626' : undefined }}
                  >
                    {val}
                  </span>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span className={`lcc-margin-pill ${marginCls}`}>
                  {fmt(margin, 1)}% margin
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ maxWidth: 'var(--fd-max)', margin: '0 auto', padding: '0 24px 40px', fontSize: 12, color: 'var(--fd-muted)', lineHeight: 1.7 }}>
        <p>
          <strong>Disclaimer:</strong> Duty and VAT rates entered here are for planning purposes only.
          Verify the exact HS code, applicable duty rate, and other levies for your specific product
          with a licensed customs broker before placing a bulk order. Exchange rates are indicative; always confirm with your bank before sending money.
        </p>
      </div>

      {/* Related tools */}
      <div className="fd-related">
        <div className="fd-container">
          <div className="fd-related-title">Other free tools</div>
          <div className="fd-related-row">
            <Link href="/business-tools/invoice-generator"  className="fd-related-link"><ArrowRight size={14} /> Invoice Generator</Link>
            <Link href="/business-tools/receipt-generator"  className="fd-related-link"><ArrowRight size={14} /> Receipt Generator</Link>
            <Link href="/business-tools/currency-converter" className="fd-related-link"><ArrowRight size={14} /> Currency Converter</Link>
            <Link href="/tracker/login"                     className="fd-related-link"><ArrowRight size={14} /> Sales Tracker</Link>
          </div>
        </div>
      </div>
    </>
  );
}
