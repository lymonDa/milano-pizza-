import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { StatusTimeline } from './components/StatusTimeline';
import { OrderItemsSummary } from './components/OrderItemsSummary';

const statusColors: Record<string, string> = {
  pending_payment: 'bg-secondary-100 text-secondary-800',
  confirmed: 'bg-primary-100 text-primary-700',
  preparing: 'bg-accent-100 text-accent-700',
  out_for_delivery: 'bg-primary-100 text-primary-800',
  delivered: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-accent-50 text-accent-600',
};

const paymentIcons: Record<string, string> = {
  cod: 'ri-cash-line',
  wallet: 'ri-smartphone-line',
};

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_total: number;
  total: number;
  estimated_delivery_minutes: number | null;
  created_at: string;
  delivery_address_snapshot: string;
  notes: string;
}

interface OrderItem {
  id: string;
  item_name_snapshot: string;
  size: string;
  unit_price: number;
  discounted_unit_price: number;
  quantity: number;
  line_total: number;
}

interface StatusStep {
  status: string;
  changed_at: string;
}

export default function OrderTracking() {
  const { t } = useTranslation('common');
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<StatusStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) { setError(true); setLoading(false); return; }
    setLoading(true);
    try {
      const [
        { data: orderData, error: orderErr },
        { data: itemsData },
        { data: historyData },
      ] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('order_items').select('*').eq('order_id', id).order('created_at', { ascending: true }),
        supabase.from('order_status_history').select('*').eq('order_id', id).order('changed_at', { ascending: true }),
      ]);

      if (orderErr || !orderData) {
        setError(true);
        return;
      }

      setOrder(orderData as OrderDetail);
      setItems((itemsData || []) as OrderItem[]);
      setHistory((historyData || []) as StatusStep[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 lg:px-8 bg-background-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-200 flex items-center justify-center">
            <i className="ri-file-search-line text-foreground-400 text-2xl" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground-950 mb-2">
            {t('orderNotFound')}
          </h1>
          <p className="text-sm text-foreground-500 mb-6">
            {t('orderNotFoundDesc')}
          </p>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-primary-500 text-background-50 rounded-md hover:bg-primary-600 transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line" />
            </span>
            {t('backToAccount')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 lg:px-8 bg-background-50">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-foreground-500">
          <Link to="/account" className="hover:text-primary-600 transition-colors">
            {t('myAccount')}
          </Link>
          <span className="text-foreground-300">/</span>
          <span className="text-foreground-800 font-medium">{t('orderTracking')}</span>
        </div>

        {/* Order Header */}
        <div className="bg-background-100 border border-background-200/70 rounded-lg p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">
                #{order.order_number}
              </h1>
              <p className="text-sm text-foreground-500 mt-1">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium w-fit whitespace-nowrap',
                statusColors[order.status] || 'bg-background-200 text-foreground-600'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i
                  className={
                    order.status === 'delivered'
                      ? 'ri-checkbox-circle-line'
                      : order.status === 'cancelled'
                        ? 'ri-close-circle-line'
                        : 'ri-time-line'
                  }
                />
              </span>
              {t(order.status)}
            </span>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-background-50 rounded-md p-3">
              <p className="text-xs text-foreground-500 mb-0.5">{t('paymentMethod')}</p>
              <p className="text-sm font-medium text-foreground-800 flex items-center gap-1.5">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className={paymentIcons[order.payment_method] || 'ri-bank-card-line'} />
                </span>
                {t(order.payment_method === 'wallet' ? 'vodafoneCash' : 'cod')}
              </p>
            </div>
            {order.status !== 'cancelled' && order.status !== 'delivered' && order.estimated_delivery_minutes && (
              <div className="bg-background-50 rounded-md p-3">
                <p className="text-xs text-foreground-500 mb-0.5">{t('estimatedDelivery')}</p>
                <p className="text-sm font-medium text-foreground-800">
                  ~{order.estimated_delivery_minutes} {t('minutes')}
                </p>
              </div>
            )}
            <div className="bg-background-50 rounded-md p-3">
              <p className="text-xs text-foreground-500 mb-0.5">{t('deliveryAddress')}</p>
              <p className="text-sm font-medium text-foreground-800 line-clamp-2">
                {order.delivery_address_snapshot}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="mt-3 bg-background-50 rounded-md p-3">
              <p className="text-xs text-foreground-500 mb-0.5">{t('notes')}</p>
              <p className="text-sm text-foreground-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Two-column: Timeline + Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Timeline */}
          <div className="bg-background-100 border border-background-200/70 rounded-lg p-5 md:p-6">
            <h3 className="text-sm font-semibold text-foreground-900 font-heading mb-4">
              {t('orderTimeline')}
            </h3>
            <StatusTimeline history={history} currentStatus={order.status} />
          </div>

          {/* Order Items */}
          <div className="bg-background-100 border border-background-200/70 rounded-lg p-5 md:p-6">
            <OrderItemsSummary
              items={items}
              subtotal={order.subtotal}
              discountTotal={order.discount_total}
              total={order.total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}