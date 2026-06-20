interface Props {
  status: string;
}

const TAG_CLASS: Record<string, string> = {
  // Stock
  'In stock':       'tag-active',
  'Low stock':      'tag-low',
  'Out of stock':   'tag-out',
  // Products
  Active:           'tag-active',
  'Out of Stock':   'tag-out',
  Discontinued:     'tag-discontinued',
  // Sales / POs
  Pending:          'tag-pending',
  Processing:       'tag-processing',
  Shipped:          'tag-shipped',
  Delivered:        'tag-delivered',
  Cancelled:        'tag-cancelled',
  Refunded:         'tag-refunded',
  // Purchases
  'In Transit':     'tag-in-transit',
  Received:         'tag-received',
  // Returns
  Denied:           'tag-cancelled',
  // Customers
  'New Customer':   'tag-new',
  'Repeat Customer':'tag-active',
  'VIP Customer':   'tag-vip',
};

export default function Badge({ status }: Props) {
  const cls = TAG_CLASS[status] ?? 'tag-new';
  return <span className={`tag ${cls}`}>{status}</span>;
}
