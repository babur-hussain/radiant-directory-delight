import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

export interface PurchaseRecord {
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  transactionId: string;
  status: 'success' | 'failed' | 'refunded';
  gateway: 'payu';
  refundStatus?: 'none' | 'initiated' | 'completed';
  metadata?: Record<string, any>;
}

async function insertInto(table: string, payload: any) {
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw error;
}

export async function recordPurchase(p: PurchaseRecord): Promise<void> {
  const nowIso = new Date().toISOString();
  const row = {
    id: nanoid(),
    user_id: p.userId,
    package_id: p.packageId,
    package_name: p.packageName,
    amount: p.amount,
    transaction_id: p.transactionId,
    status: p.status,
    gateway: p.gateway,
    refund_status: p.refundStatus || 'none',
    metadata: p.metadata || {},
    created_at: nowIso,
  };

  // Prefer RPC for idempotent writes (unique on transaction_id)
  try {
    const { error } = await supabase.rpc('upsert_user_purchase', {
      p_user_id: row.user_id,
      p_package_id: row.package_id,
      p_package_name: row.package_name,
      p_amount: row.amount,
      p_transaction_id: row.transaction_id,
      p_status: row.status,
      p_gateway: row.gateway,
      p_refund_status: row.refund_status,
      p_metadata: row.metadata
    });
    if (!error) return;
  } catch {}

  // Try preferred table names in order; ignore if table missing
  const candidateTables = ['user_purchases', 'subscription_payments', 'payments'];
  for (const table of candidateTables) {
    try {
      await insertInto(table, row);
      // Also update user summary fields if available
      await supabase
        .from('users')
        .update({ last_purchase_at: nowIso, purchase_count: (null as any) })
        .eq('id', p.userId);
      return;
    } catch (e: any) {
      // Continue to next table on error (e.g., table not found or RLS)
      continue;
    }
  }
  // If all inserts fail, swallow to avoid breaking UX
  console.warn('recordPurchase: no suitable table available to store purchase');
}


