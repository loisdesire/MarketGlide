export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$',    name: 'US Dollar' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  NGN: { symbol: '₦',   name: 'Nigerian Naira' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  ZAR: { symbol: 'R',   name: 'South African Rand' },
  GBP: { symbol: '£',   name: 'British Pound' },
  EUR: { symbol: '€',   name: 'Euro' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[];

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, CAD: 1.37, NGN: 1550, GHS: 15.6, KES: 129, ZAR: 18.4, GBP: 0.79, EUR: 0.92,
};

export const PLATFORMS = ['Alibaba', '1688', 'Taobao', 'Temu', 'AliExpress', 'Other'] as const;

export const CHANNELS = [
  'Website', 'Instagram', 'Facebook', 'TikTok Shop',
  'Amazon', 'Etsy', 'Physical Store', 'WhatsApp',
] as const;

export const PAYMENT_METHODS = [
  'Cash', 'Debit Card', 'Credit Card', 'PayPal', 'Stripe', 'Bank Transfer',
] as const;

export const CATEGORIES = [
  'Fashion & Apparel', 'Beauty & Personal Care', 'Electronics & Gadgets',
  'Home & Kitchen', 'Baby & Kids', 'Accessories', 'Other',
] as const;

export const PRODUCT_STATUSES = ['Active', 'Out of Stock', 'Discontinued'] as const;

export const SALE_STATUSES = [
  'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded',
] as const;

export const RETURN_REASONS = [
  'Defective', 'Wrong Item', 'Damaged', 'Customer Changed Mind',
] as const;

export const RETURN_STATUSES = ['Pending', 'Refunded', 'Denied'] as const;

export const PO_STATUSES = ['Pending', 'In Transit', 'Received', 'Cancelled'] as const;

export const CUSTOMER_CLASSIFICATIONS = [
  'New Customer', 'Repeat Customer', 'VIP Customer',
] as const;

/** Sales statuses that mean the stock was NOT deducted (or was returned). */
export const RESTOCK_STATUSES: string[] = ['Cancelled', 'Refunded'];
