import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const statusColors: Record<string, string> = {
  pending_payment: 'bg-secondary-100 text-secondary-800',
  confirmed: 'bg-primary-100 text-primary-700',
  preparing: 'bg-accent-100 text-accent-700',
  out_for_delivery: 'bg-primary-100 text-primary-800',
  delivered: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-accent-50 text-accent-600',
};

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
}

function DashboardContent() {
  const { t } = useTranslation('common');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const startOfDay = `${today}T00:00:00Z`;
      const endOfDay = `${today}T23:59:59Z`;

      const [
        { count: ordersTodayCount },
        { data: revenueTodayData },
        { count: pendingCount },
        { count: activeProductsCount },
        { count: totalOrdersCount },
        { data: totalRevenueData },
        { data: customersData },
        { data: recentData },
        { data: avgData },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay),
        supabase.from('orders').select('total').gte('created_at', startOfDay).lte('created_at', endOfDay),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_payment'),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('is_available', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
        supabase.from('orders').select('user_id'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('total'),
      ]);

      const revenueToday = (revenueTodayData || []).reduce((sum, o) => sum + Number(o.total), 0);
      const totalRevenue = (totalRevenueData || []).reduce((sum, o) => sum + Number(o.total), 0);
      const uniqueCustomers = new Set((customersData || []).map((o) => o.user_id)).size;
      const avgOrderValue = (avgData || []).length > 0
        ? Math.round((avgData || []).reduce((sum, o) => sum + Number(o.total), 0) / (avgData || []).length)
        : 0;

      setStats({
        ordersToday: ordersTodayCount || 0,
        revenueToday,
        pendingOrders: pendingCount || 0,
        activeProducts: activeProductsCount || 0,
        totalOrders: totalOrdersCount || 0,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        avgOrderValue,
      });
      setRecentOrders((recentData || []) as RecentOrder[]);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { lastRefreshed, isRefreshing } = useAutoRefresh({
    intervalMs: 30000,
    onRefresh: fetchData,
  });

  const statCards = [
    {
      label: t('ordersToday'),
      value: stats.ordersToday,
      icon: 'ri-shopping-bag-3-line',
      color: 'bg-primary-50 text-primary-600',
      change: '+12%',
      changeUp: true,
    },
    {
      label: t('revenueToday'),
      value: `${stats.revenueToday.toLocaleString()} EGP`,
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-accent-50 text-accent-600',
      change: '+8%',
      changeUp: true,
    },
    {
      label: t('pendingOrders'),
      value: stats.pendingOrders,
      icon: 'ri-time-line',
      color: 'bg-secondary-50 text-secondary-700',
      change: 'Needs attention',
      changeUp: false,
    },
    {
      label: t('activeProducts'),
      value: stats.activeProducts,
      icon: 'ri-restaurant-line',
      color: 'bg-primary-50 text-primary-700',
      change: 'All available',
      changeUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">
            {t('adminDashboard')}
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
            {t('adminDashboardDesc')}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-background-100 border border-background-200/70 rounded-full">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
                timeRange === range
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:text-foreground-800'
              )}
            >
              {t(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-background-100 border border-background-200/70 rounded-lg p-4 md:p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-foreground-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.color)}>
                <i className={stat.icon} />
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground-950 font-heading">
              {stat.value}
            </p>
            <p
              className={cn(
                'text-xs mt-1',
                stat.changeUp ? 'text-primary-600' : 'text-foreground-500'
              )}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Overview + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview stats */}
        <div className="bg-background-100 border border-background-200/70 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground-900 font-heading mb-4">
            {t('overview')}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-600">{t('totalOrders')}</span>
              <span className="text-sm font-semibold text-foreground-950">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-600">{t('totalRevenue')}</span>
              <span className="text-sm font-semibold text-foreground-950">{stats.totalRevenue.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-600">{t('totalCustomers')}</span>
              <span className="text-sm font-semibold text-foreground-950">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-600">{t('avgOrderValue')}</span>
              <span className="text-sm font-semibold text-foreground-950">{stats.avgOrderValue} EGP</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 pt-4 border-t border-background-200/70">
            <h4 className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
              {t('quickActions')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/products"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-circle-line" />
                </span>
                {t('addProduct')}
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-secondary-50 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-file-list-3-line" />
                </span>
                {t('viewOrders')}
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-background-100 border border-background-200/70 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground-900 font-heading">
              {t('recentOrders')}
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('viewAll')}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-background-200/70">
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    {t('order')}
                  </th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="text-right py-2.5 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors"
                  >
                    <td className="py-2.5 px-2">
                      <p className="text-xs font-medium text-foreground-800 whitespace-nowrap">
                        #{order.order_number}
                      </p>
                      <p className="text-[10px] text-foreground-400">
                        {new Date(order.created_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="py-2.5 px-2">
                      <p className="text-xs text-foreground-700 truncate max-w-[120px]">
                        {order.customer_name}
                      </p>
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                          statusColors[order.status] || 'bg-background-200 text-foreground-600'
                        )}
                      >
                        {t(order.status)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className="text-xs font-semibold text-foreground-900 whitespace-nowrap">
                        {order.total} EGP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}