import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'dashboard', icon: 'ri-dashboard-line' },
  { to: '/admin/products', label: 'products', icon: 'ri-restaurant-2-line' },
  { to: '/admin/orders', label: 'orders', icon: 'ri-receipt-line' },
  { to: '/admin/offers', label: 'offers', icon: 'ri-percent-line' },
  { to: '/admin/events', label: 'events', icon: 'ri-calendar-event-line' },
  { to: '/admin/messages', label: 'messages', icon: 'ri-mail-line' },
  { to: '/admin/content', label: 'content', icon: 'ri-pages-line' },
  { to: '/admin/settings', label: 'settings', icon: 'ri-settings-3-line' },
  { to: '/admin/users', label: 'users', icon: 'ri-group-line' },
  { to: '/admin/activity', label: 'activity', icon: 'ri-history-line' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (to: string) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-background-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-60 bg-background-100 border-r border-background-200/70 flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-background-200/70">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
            <i className="ri-restaurant-2-line text-background-50 text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold font-heading text-foreground-950 truncate">
              {t('brand')}
            </p>
            <p className="text-[10px] text-foreground-500 uppercase tracking-wider">{t('admin')}</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-foreground-600 hover:text-foreground-800 hover:bg-background-200/60'
              )}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <i className={item.icon} />
              </span>
              {t(item.label)}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-background-200/70 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-xs text-foreground-500 hover:text-foreground-700 hover:bg-background-200/60 rounded-md transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line" />
            </span>
            {t('backToHome')}
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-xs text-foreground-500 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer w-full"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-logout-box-r-line" />
            </span>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-background-100 border-b border-background-200/70 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md text-foreground-600 hover:bg-background-200/60 transition-colors cursor-pointer"
          >
            <i className="ri-menu-line text-lg" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-foreground-500">{t('admin')}</p>
              <p className="text-sm font-medium text-foreground-800 truncate max-w-[160px]">
                {user?.email}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <span className="text-primary-600 text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}