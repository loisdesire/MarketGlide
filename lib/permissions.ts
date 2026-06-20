export type UserRole = 'Administrator' | 'Manager' | 'Sales Staff' | 'Warehouse Staff';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Administrator:    ['dashboard','products','inventory','purchases','sales','returns','customers','invoices','reports','settings'],
  Manager:          ['dashboard','products','inventory','purchases','sales','returns','customers','invoices','reports'],
  'Sales Staff':    ['sales','invoices'],
  'Warehouse Staff':['inventory'],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Administrator:    'Full access to every module, including business settings and user management.',
  Manager:          'Access to all operational modules — products, inventory, purchases, sales, returns, customers, invoices and reports.',
  'Sales Staff':    'Sales entry and invoice / receipt generation only.',
  'Warehouse Staff':'Inventory module only — stock levels, manual adjustments and reorder alerts.',
};

export function hasAccess(role: UserRole | null | undefined, tabId: string): boolean {
  if (!role) return false;
  return (ROLE_PERMISSIONS[role] ?? []).includes(tabId);
}

export function firstAllowedTab(role: UserRole | null | undefined): string {
  if (!role) return 'dashboard';
  return (ROLE_PERMISSIONS[role] ?? ['dashboard'])[0];
}

/** Throws a 403 Response if the role is not in the allowed list. */
export function requireRole(role: UserRole | null | undefined, allowed: UserRole[]): void {
  if (!role || !allowed.includes(role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
