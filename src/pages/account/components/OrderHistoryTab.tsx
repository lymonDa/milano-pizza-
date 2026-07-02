import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const statusColors: Record<string, string> = {
  pending_payment: 'bg-secondary-100 text-secondary-800',
  confirmed: 'bg-primary-100 text-primary-700',
  preparing: 'bg-accent-100 text-accent-700',
  out_for_delivery: 'bg-primary-100 text-primary-800',
  delivered: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-accent-50 text-accent-600',
};

const statusIcons: Record<string, string> = {
  pending_payment: 'ri-time-line',
  confirmed: 'ri-check-double-line',
  preparing: 'ri-fire-line',
  out_for_delivery: 'ri-motorbike-line',
  delivered: 'ri-checkbox-circle-line',
  cancelled: 'ri-close-circle-line',
};

const paymentIcons: Record<string, string> = {
  cod: 'ri-cash-line',
  wallet: 'ri-smartphone-line',
};

interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
  estimated_delivery_minutes: number | null;
}

export function OrderHistoryTab() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orderList = (data || []) as OrderSummary[];
      setOrders(orderList);

      // Fetch item counts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        orderList.map(async (order) => {
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id);
          counts[order.id] = count || 0;
        })
      );
      setItemCounts(counts);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-background-100 border border-background-200/70 rounded-lg">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background-200 flex items-center justify-center">
          <i className="ri-receipt-line text-foreground-400 text-xl" />
        </div>
        <p className="text-sm font-medium text-foreground-800">{t('noOrders')}</p>
        <p className="text-xs text-foreground-500 mt-1">{t('noOrdersDesc')}</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <i className="ri-restaurant-line" />
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/order/${order.id}`}
          className="block bg-background-100 border border-background-200/70 rounded-lg p-4 hover:border-background-300/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground-950 font-heading">
                #{order.order_number}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[order.status] || 'bg-background-200 text-foreground-600'
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className={`${statusIcons[order.status] || 'ri-question-line'} text-[10px]`} />
                </span>
                {t(order.status)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-background-200 text-foreground-600">
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className={`${paymentIcons[order.payment_method] || 'ri-bank-card-line'} text-[10px]`} />
              </span>
              {t(order.payment_method === 'wallet' ? 'vodafoneCash' : 'cod')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-foreground-500">
            <span>
              {new Date(order.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-foreground-300">·</span>
            <span>{itemCounts[order.id] || 0} {t('items')}</span>
            <span className="text-foreground-300">·</span>
            <span className="font-medium text-foreground-800">
              {order.total} EGP
            </span>
          </div>

          {order.status !== 'cancelled' && order.status !== 'delivered' && order.estimated_delivery_minutes && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-primary-600">
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className="ri-time-line" />
              </span>
              {t('estimatedDelivery')}: {order.estimated_delivery_minutes} {t('minutes')}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}