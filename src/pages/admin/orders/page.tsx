import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface OrderItem {
  id: string;
  item_name_snapshot: string;
  size: string;
  quantity: number;
  unit_price: number;
  discounted_unit_price: number;
  line_total: number;
  addons_snapshot: Array<{ id: string; name: string; price: number; quantity: number }>;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_proof_url?: string;
  subtotal: number;
  discount_total: number;
  total: number;
  created_at: string;
  delivery_address_snapshot: string;
  notes?: string;
  items?: OrderItem[];
  items_summary: string;
}

type StatusFilter = 'all' | 'pending_payment' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusFilters: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'all', color: 'bg-foreground-900 text-background-50' },
  { key: 'pending_payment', label: 'pending_payment', color: 'bg-secondary-500 text-background-50' },
  { key: 'confirmed', label: 'confirmed', color: 'bg-primary-100 text-primary-700' },
  { key: 'preparing', label: 'preparing', color: 'bg-accent-100 text-accent-700' },
  { key: 'out_for_delivery', label: 'out_for_delivery', color: 'bg-primary-100 text-primary-800' },
  { key: 'delivered', label: 'delivered', color: 'bg-primary-100 text-primary-700' },
  { key: 'cancelled', label: 'cancelled', color: 'bg-accent-50 text-accent-600' },
];

const statusRowColors: Record<string, string> = {
  pending_payment: 'bg-secondary-100 text-secondary-800',
  confirmed: 'bg-primary-100 text-primary-700',
  preparing: 'bg-accent-100 text-accent-700',
  out_for_delivery: 'bg-primary-100 text-primary-800',
  delivered: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-accent-50 text-accent-600',
};

const nextStatusOptions: Record<string, string[]> = {
  pending_payment: ['confirmed'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const nextStatusLabels: Record<string, string> = {
  confirmed: 'confirmOrder',
  preparing: 'startPreparing',
  out_for_delivery: 'sendForDelivery',
  delivered: 'markDelivered',
  cancelled: 'cancelOrder',
};

function OrdersContent() {
  const { t } = useTranslation('common');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');
  const [paymentReviewing, setPaymentReviewing] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithSummary = await Promise.all(
        (data || []).map(async (order) => {
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id);

          const itemCount = count || 0;
          return {
            ...order,
            items_summary: itemCount === 1 ? '1 item' : `${itemCount} items`,
          };
        })
      );

      setOrders(ordersWithSummary);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const { lastRefreshed, isRefreshing } = useAutoRefresh({
    intervalMs: 30000,
    onRefresh: fetchOrders,
  });

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingDetail(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems((data || []) as OrderItem[]);
    } catch {
      setOrderItems([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setOrderItems([]);
    setStatusError('');
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);
    setStatusError('');
    try {
      const { data, error } = await supabase.functions.invoke('update-order-status', {
        body: { orderId, newStatus },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to update order');

      await fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update order');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handlePaymentReview = async (orderId: string, action: 'approve' | 'reject') => {
    setPaymentReviewing(true);
    setReviewMsg('');
    setStatusError('');
    try {
      const { data, error } = await supabase.functions.invoke('review-payment', {
        body: { orderId, action },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.message || 'Review failed');

      setReviewMsg(data.message);

      await fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? {
          ...prev,
          payment_status: action === 'approve' ? 'confirmed' : 'rejected',
          status: action === 'approve' ? 'confirmed' : 'cancelled',
        } : null);
      }
    } catch (err: any) {
      setStatusError(err.message || 'Payment review failed');
    } finally {
      setPaymentReviewing(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pendingReviewCount = orders.filter(
    (o) => o.payment_method === 'wallet' && o.payment_status === 'pending'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">
            {t('orderManagement')}
            <span className="ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-600">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                isRefreshing ? 'bg-accent-500 animate-pulse' : 'bg-primary-500'
              )} />
              {isRefreshing ? t('updating') : t('live')}
              {lastRefreshed && (
                <span className="text-[9px] text-primary-400 ml-0.5">
                  {lastRefreshed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </span>
          </h1>
          <p className="text-sm text-foreground-500 mt-0.5">
            {t('orderManagementDesc')}
          </p>
        </div>
        {pendingReviewCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-accent-50 border border-accent-200/70 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-sm font-medium text-accent-700">
              {pendingReviewCount} {pendingReviewCount === 1 ? t('paymentProofPending') : t('paymentProofsPending')}
            </span>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
            <i className="ri-search-line text-sm" />
          </span>
          <input
            type="text"
            placeholder={`${t('searchOrders')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setStatusError(''); }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
                activeFilter === f.key
                  ? f.color
                  : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
              )}
            >
              {t(f.label)}
              {f.key === 'pending_payment' && pendingReviewCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-bold">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {statusError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-accent-50 border border-accent-200/70 rounded-lg text-sm text-accent-700">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-error-warning-line" />
            </span>
            {statusError}
          </div>
          <button
            onClick={() => setStatusError('')}
            className="w-6 h-6 flex items-center justify-center text-accent-500 hover:text-accent-700 rounded cursor-pointer"
          >
            <i className="ri-close-line" />
          </button>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('order')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('customer')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('payment')}
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => openOrderDetail(order)}
                  className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p className="text-xs font-medium text-foreground-800 whitespace-nowrap">
                      #{order.order_number}
                    </p>
                    <p className="text-[10px] text-foreground-400">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-medium text-foreground-800 whitespace-nowrap">
                      {order.customer_name}
                    </p>
                    <p className="text-[10px] text-foreground-400">{order.customer_phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                          order.payment_method === 'wallet'
                            ? 'bg-secondary-50 text-secondary-700'
                            : 'bg-background-200 text-foreground-600'
                        )}
                      >
                        {order.payment_method === 'wallet' ? 'Vodafone Cash' : t('cod')}
                      </span>
                      {order.payment_method === 'wallet' && order.payment_status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-accent-600 font-medium">
                          <i className="ri-error-warning-line" />
                          {t('pendingReview')}
                        </span>
                      )}
                      {order.payment_method === 'wallet' && order.payment_status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary-600">
                          <i className="ri-check-double-line" />
                          {t('confirmed')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                        statusRowColors[order.status] || 'bg-background-200 text-foreground-600'
                      )}
                    >
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs font-semibold text-foreground-900 whitespace-nowrap">
                      {order.total} EGP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto rounded-full bg-background-200 flex items-center justify-center mb-3">
              <i className="ri-receipt-line text-foreground-400 text-lg" />
            </div>
            <p className="text-sm text-foreground-500">{t('noOrdersFound')}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-foreground-400">
        {filteredOrders.length} {filteredOrders.length === 1 ? t('orderSingular') : t('orderPlural')}
      </p>

      {/* ==================== ORDER DETAIL SLIDE-OVER ==================== */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground-950/30"
            onClick={closeOrderDetail}
          />

          {/* Slide-over panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-background-50 flex flex-col shadow-2xl animate-slide-in-right">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-background-200/70 shrink-0 print:hidden">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeOrderDetail}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-foreground-500 hover:text-foreground-700 hover:bg-background-200/60 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-lg" />
                </button>
                <div>
                  <h2 className="text-sm font-bold font-heading text-foreground-950">
                    {t('orderFullDetail')}
                  </h2>
                  <p className="text-xs text-foreground-500">#{selectedOrder.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOrder}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground-600 bg-background-100 border border-background-200/70 rounded-md hover:bg-background-200/60 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-printer-line" />
                  </span>
                  {t('printOrder')}
                </button>
                {nextStatusOptions[selectedOrder.status] && nextStatusOptions[selectedOrder.status].length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(selectedOrder.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 text-xs font-medium bg-primary-500 text-background-50 rounded-md cursor-pointer border-none outline-none appearance-none whitespace-nowrap"
                  >
                    <option value="">{t('actions')} ▾</option>
                    {nextStatusOptions[selectedOrder.status].map((ns) => (
                      <option key={ns} value={ns}>
                        {t(nextStatusLabels[ns] || ns)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Panel body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 print:overflow-visible print:p-0">
              {/* Status & Time */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                    statusRowColors[selectedOrder.status] || 'bg-background-200 text-foreground-600'
                  )}
                >
                  {t(selectedOrder.status)}
                </span>
                <span className="text-xs text-foreground-500">
                  {t('orderCreatedAt')}: {new Date(selectedOrder.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
                  {t('customerInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-foreground-500">{t('fullName')}</p>
                    <p className="font-medium text-foreground-900">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-500">{t('phone')}</p>
                    <p className="font-medium text-foreground-900">
                      <a href={`tel:${selectedOrder.customer_phone}`} className="hover:text-primary-600 transition-colors">
                        {selectedOrder.customer_phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
                  {t('deliveryInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-foreground-500">{t('deliveryAddressSnapshot')}</p>
                    <p className="text-sm font-medium text-foreground-900">{selectedOrder.delivery_address_snapshot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-500">{t('deliveryNotesLabel')}</p>
                    <p className="text-sm text-foreground-700">
                      {selectedOrder.notes || t('noNotes')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-500">{t('paymentMethod')}</p>
                    <p className="text-sm font-medium text-foreground-900">
                      {selectedOrder.payment_method === 'wallet' ? 'Vodafone Cash' : t('cod')}
                      {selectedOrder.payment_method === 'wallet' && (
                        <span className="ml-2 text-xs text-foreground-500">
                          — {t(selectedOrder.payment_status === 'pending' ? 'pendingReview' : selectedOrder.payment_status === 'confirmed' ? 'confirmed' : selectedOrder.payment_status)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vodafone Cash Proof (if applicable) */}
              {selectedOrder.payment_method === 'wallet' && selectedOrder.payment_proof_url && (
                <div className="bg-background-100 border border-background-200/70 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
                    {t('paymentProof')}
                  </h3>
                  <div className="border border-background-300/60 rounded-lg overflow-hidden">
                    <img
                      src={selectedOrder.payment_proof_url}
                      alt="Payment proof"
                      className="w-full object-cover cursor-pointer"
                      onClick={() => window.open(selectedOrder.payment_proof_url, '_blank')}
                    />
                  </div>

                  {/* Approve / Reject buttons for pending Vodafone Cash payments */}
                  {selectedOrder.payment_status === 'pending' && (
                    <div className="mt-4 space-y-3">
                      {reviewMsg && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-md text-xs">
                          <span className="w-4 h-4 flex items-center justify-center shrink-0">
                            <i className="ri-check-double-line" />
                          </span>
                          {reviewMsg}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePaymentReview(selectedOrder.id, 'approve')}
                          disabled={paymentReviewing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-background-50 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {paymentReviewing ? (
                            <span className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin" />
                          ) : (
                            <span className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-check-line" />
                            </span>
                          )}
                          {t('approvePayment')}
                        </button>
                        <button
                          onClick={() => handlePaymentReview(selectedOrder.id, 'reject')}
                          disabled={paymentReviewing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-50 text-accent-700 border border-accent-200/70 rounded-md text-sm font-medium hover:bg-accent-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {paymentReviewing ? (
                            <span className="w-4 h-4 border-2 border-accent-300 border-t-accent-600 rounded-full animate-spin" />
                          ) : (
                            <span className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-close-line" />
                            </span>
                          )}
                          {t('rejectPayment')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
                  {t('orderBreakdown')}
                </h3>

                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="pb-3 border-b border-background-200/50 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground-900">
                              {item.quantity}x {item.item_name_snapshot}
                            </p>
                            <p className="text-xs text-foreground-500 mt-0.5">
                              {t('sizeLabel')}: {item.size}
                              {' · '}
                              {t('unitPrice')}: {item.unit_price} EGP
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground-900 whitespace-nowrap">
                            {item.line_total} EGP
                          </p>
                        </div>

                        {/* Addons */}
                        {item.addons_snapshot && Array.isArray(item.addons_snapshot) && item.addons_snapshot.length > 0 ? (
                          <div className="mt-2 ml-3 pl-3 border-l-2 border-background-200/70 space-y-1">
                            <p className="text-[10px] text-foreground-500 uppercase tracking-wider">{t('addonsLabel')}</p>
                            {item.addons_snapshot.map((addon, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-foreground-600">
                                  {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                                </span>
                                <span className="text-foreground-500 ml-2">+{addon.price * addon.quantity} EGP</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-[10px] text-foreground-400 ml-3">{t('noAddons')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="mt-4 pt-3 border-t border-background-200/70 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-500">{t('subtotal')}</span>
                    <span className="text-foreground-800">{selectedOrder.subtotal} EGP</span>
                  </div>
                  {selectedOrder.discount_total > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-accent-600">{t('discount')}</span>
                      <span className="text-accent-600">-{selectedOrder.discount_total} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1.5 border-t border-background-200/50">
                    <span className="text-foreground-950">{t('total')}</span>
                    <span className="text-foreground-950">{selectedOrder.total} EGP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Print-only styles */}
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .fixed.top-0.right-0.z-50 { 
                visibility: visible !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              .fixed.top-0.right-0.z-50 * { visibility: visible !important; }
              .print\\:hidden { display: none !important; }
              .print\\:overflow-visible { overflow: visible !important; }
              .print\\:p-0 { padding: 0 !important; }
            }
          `}</style>
        </>
      )}

      {/* Add slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <OrdersContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}