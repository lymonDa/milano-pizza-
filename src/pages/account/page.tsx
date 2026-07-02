import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthGuard } from '@/components/feature/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ProfileTab } from './components/ProfileTab';
import { AddressesTab } from './components/AddressesTab';
import { OrderHistoryTab } from './components/OrderHistoryTab';

type TabKey = 'profile' | 'addresses' | 'orders';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'profile', label: 'profile', icon: 'ri-user-line' },
  { key: 'addresses', label: 'addresses', icon: 'ri-map-pin-line' },
  { key: 'orders', label: 'orderHistory', icon: 'ri-receipt-line' },
];

function AccountContent() {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6 lg:px-8 bg-background-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950">
              {t('myAccount')}
            </h1>
            <p className="text-sm text-foreground-500 mt-1">
              {t('signedInAs')} <span className="font-medium text-foreground-700">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground-600 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-logout-box-r-line" />
            </span>
            {t('logout')}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-background-100 border border-background-200/70 rounded-full mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap flex-1 justify-center',
                activeTab === tab.key
                  ? 'bg-primary-500 text-background-50 shadow-sm'
                  : 'text-foreground-600 hover:text-foreground-800'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon} />
              </span>
              <span className="hidden sm:inline">{t(tab.label)}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-background-100 border border-background-200/70 rounded-lg p-5 md:p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'orders' && <OrderHistoryTab />}
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}