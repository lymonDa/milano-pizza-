import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Modal } from '@/components/base/Modal';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function MessagesContent() {
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw new Error(err.message);
      setMessages((data || []) as Message[]);
    } catch (er: unknown) {
      setError(er instanceof Error ? er.message : String(er));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { lastRefreshed, isRefreshing } = useAutoRefresh({
    intervalMs: 60000,
    onRefresh: fetchData,
  });

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'read') return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const toggleRead = async (id: string, currentIsRead: boolean) => {
    const newState = !currentIsRead;
    setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: newState } : m)));
    if (selectedMsg?.id === id) setSelectedMsg({ ...selectedMsg, is_read: newState });
    try {
      await supabase.from('contact_messages').update({ is_read: newState }).eq('id', id);
    } catch { /* silent */ }
  };

  const handleSelect = (m: Message) => {
    setSelectedMsg(m);
    if (!m.is_read) toggleRead(m.id, m.is_read);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: delErr } = await supabase.from('contact_messages').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);
      if (selectedMsg?.id === id) setSelectedMsg(null);
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
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
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">
            {t('messages')}
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
            {unreadCount > 0 ? `${unreadCount} ${t('unreadMessages')}` : t('messagesManagementDesc')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {[
          { key: 'all' as const, label: 'all' },
          { key: 'unread' as const, label: 'unread' },
          { key: 'read' as const, label: 'read' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
              filter === f.key
                ? 'bg-foreground-900 text-background-50'
                : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
            )}
          >
            {t(f.label)}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-bold">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
          <div className="divide-y divide-background-200/50 max-h-[600px] overflow-y-auto">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={cn(
                  'w-full text-left p-4 transition-colors cursor-pointer hover:bg-background-50',
                  selectedMsg?.id === m.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : '',
                  !m.is_read ? 'bg-background-50' : ''
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={cn('text-sm font-medium truncate max-w-[160px]', !m.is_read ? 'text-foreground-900' : 'text-foreground-700')}>
                    {m.name}
                  </span>
                  {!m.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-foreground-500 truncate mb-1">{m.message.slice(0, 60)}...</p>
                <p className="text-[10px] text-foreground-400">{new Date(m.created_at).toLocaleDateString()}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-foreground-500">{t('noMessages')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-background-100 border border-background-200/70 rounded-lg p-5">
          {selectedMsg ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground-950 font-heading">{selectedMsg.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-foreground-500">
                    <span className="flex items-center gap-1"><i className="ri-mail-line" />{selectedMsg.email}</span>
                    {selectedMsg.phone && <span className="flex items-center gap-1"><i className="ri-phone-line" />{selectedMsg.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRead(selectedMsg.id, selectedMsg.is_read)}
                    className={cn(
                      'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap',
                      selectedMsg.is_read ? 'bg-background-200 text-foreground-600' : 'bg-primary-50 text-primary-700'
                    )}
                  >
                    {selectedMsg.is_read ? t('markUnread') : t('markRead')}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selectedMsg.id)}
                    className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
              <div className="border-t border-background-200/70 pt-4">
                <p className="text-xs text-foreground-500 mb-2">{t('receivedAt')}: {new Date(selectedMsg.created_at).toLocaleString()}</p>
                <div className="bg-background-50 rounded-lg p-4 border border-background-200/70">
                  <p className="text-sm text-foreground-800 leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-background-200 flex items-center justify-center mb-3">
                <i className="ri-mail-open-line text-foreground-400 text-lg" />
              </div>
              <p className="text-sm text-foreground-500">{t('selectMessage')}</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title={t('confirmDelete')}>
        <p className="text-sm text-foreground-600 mb-6">{t('confirmDeleteMsgDesc')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
          <Button variant="danger" size="sm" onClick={() => deleteTarget && handleDelete(deleteTarget)}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminMessages() {
  return <AdminAuthGuard><AdminLayout><MessagesContent /></AdminLayout></AdminAuthGuard>;
}