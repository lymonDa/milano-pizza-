import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Modal } from '@/components/base/Modal';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

function UsersContent() {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'customer'>('all');
  const [roleChangeTarget, setRoleChangeTarget] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .order('created_at', { ascending: false });

      if (profErr) throw new Error(profErr.message);

      setUsers(((profiles || []) as Record<string, unknown>[]).map((p) => ({
        id: p.id as string,
        full_name: (p.full_name as string) || 'Unknown',
        email: '',
        phone: (p.phone as string) || '',
        role: (p.role as string) || 'customer',
        created_at: p.created_at as string,
      })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = searchQuery === '' || u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;

  const toggleRole = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    setSaving(true);
    try {
      const { error: updErr } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
      if (updErr) throw new Error(updErr.message);
      setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      setRoleChangeTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-foreground-600">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchData}>{t('retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('users')}</h1>
          <p className="text-sm text-foreground-500 mt-0.5">
            {users.length} {t('userPlural')} — {adminCount} {t('adminPlural')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400">
            <i className="ri-search-line text-sm" />
          </span>
          <input
            type="text"
            placeholder={`${t('searchUsers')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {([
            { key: 'all' as const, label: 'all' },
            { key: 'admin' as const, label: 'admin' },
            { key: 'customer' as const, label: 'customer' },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterRole(f.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
                filterRole === f.key
                  ? 'bg-foreground-900 text-background-50'
                  : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
              )}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('user')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('email')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('phone')}</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('role')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('joined')}</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-background-200 text-foreground-500'
                      )}>
                        <span className="text-xs font-bold">{u.full_name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground-800 truncate max-w-[140px]">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-600">{u.email || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-500">{u.phone || '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                      u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-background-200 text-foreground-600'
                    )}>
                      {t(u.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-500">{new Date(u.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setRoleChangeTarget(u)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-swap-line" />
                      {u.role === 'admin' ? t('demoteToCustomer') : t('promoteToAdmin')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-foreground-500">{t('noUsersFound')}</p>
          </div>
        )}
      </div>

      <Modal isOpen={roleChangeTarget !== null} onClose={() => setRoleChangeTarget(null)} title={t('confirmRoleChange')}>
        {roleChangeTarget && (
          <div className="space-y-4">
            <p className="text-sm text-foreground-600">
              {t('confirmRoleChangeDesc', {
                name: roleChangeTarget.full_name,
                role: t(roleChangeTarget.role === 'admin' ? 'customer' : 'admin'),
              })}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setRoleChangeTarget(null)}>{t('cancel')}</Button>
              <Button variant="primary" size="sm" onClick={() => toggleRole(roleChangeTarget.id)} disabled={saving}>{t('confirm')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminUsers() {
  return <AdminAuthGuard><AdminLayout><UsersContent /></AdminLayout></AdminAuthGuard>;
}