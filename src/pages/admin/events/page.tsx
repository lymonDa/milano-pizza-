import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Modal } from '@/components/base/Modal';

interface Event {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  event_date: string;
  created_at: string;
}

interface Registration {
  id: string;
  event_id: string;
  guest_name: string;
  guest_phone: string;
  created_at: string;
}

function EventsContent() {
  const { t } = useTranslation('common');
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ title_ar: '', title_en: '', description_ar: '', description_en: '', image_url: '', event_date: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewRegs, setViewRegs] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [evRes, regRes] = await Promise.all([
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('event_registrations').select('*').order('created_at', { ascending: false }),
      ]);
      if (evRes.error) throw new Error(evRes.error.message);
      if (regRes.error) throw new Error(regRes.error.message);
      setEvents((evRes.data || []) as Event[]);
      setRegistrations((regRes.data || []) as Registration[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditingEvent(null);
    setForm({ title_ar: '', title_en: '', description_ar: '', description_en: '', image_url: '', event_date: '' });
    setModalOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditingEvent(e);
    setForm({ title_ar: e.title_ar, title_en: e.title_en, description_ar: e.description_ar || '', description_en: e.description_en || '', image_url: e.image_url || '', event_date: e.event_date.slice(0, 16) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title_en.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title_ar: form.title_ar,
        title_en: form.title_en,
        description_ar: form.description_ar,
        description_en: form.description_en,
        image_url: form.image_url,
        event_date: new Date(form.event_date).toISOString(),
      };

      if (editingEvent) {
        const { error: updErr } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabase.from('events').insert(payload);
        if (insErr) throw new Error(insErr.message);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('event_registrations').delete().eq('event_id', id);
      const { error: delErr } = await supabase.from('events').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const eventRegs = (eventId: string) => registrations.filter((r) => r.event_id === eventId);
  const upcoming = (e: Event) => new Date(e.event_date) > new Date();

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
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('events')}</h1>
          <p className="text-sm text-foreground-500 mt-0.5">{events.length} {t('event').toLowerCase()}s</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <i className="ri-add-line" />{t('addEvent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((e) => (
          <div key={e.id} className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
            <div className="h-40 overflow-hidden">
              {e.image_url ? (
                <img src={e.image_url} alt={e.title_en} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-background-200 flex items-center justify-center">
                  <i className="ri-calendar-event-line text-3xl text-foreground-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground-900">{e.title_en}</h3>
                  <p className="text-xs text-foreground-400">{e.title_ar}</p>
                </div>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                  upcoming(e) ? 'bg-primary-100 text-primary-700' : 'bg-background-200 text-foreground-500'
                )}>
                  {upcoming(e) ? t('upcoming') : t('past')}
                </span>
              </div>
              <p className="text-xs text-foreground-500 line-clamp-2 mb-3">{e.description_en}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-foreground-500">
                  <i className="ri-calendar-line" />
                  {new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewRegs(e.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-secondary-50 text-secondary-700 rounded-md hover:bg-secondary-100 transition-colors cursor-pointer whitespace-nowrap">
                    <i className="ri-user-line" />{eventRegs(e.id).length}
                  </button>
                  <button onClick={() => openEdit(e)} className="w-7 h-7 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                    <i className="ri-edit-line text-xs" />
                  </button>
                  <button onClick={() => setDeleteTarget(e.id)} className="w-7 h-7 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer">
                    <i className="ri-delete-bin-line text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? t('editEvent') : t('addEvent')} className="max-w-lg">
        <div className="space-y-4">
          <Input label={`${t('name')} (EN)`} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Italian Pizza Night" required />
          <Input label={`${t('name')} (AR)`} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder="ليلة البيتزا الإيطالية" />
          <div>
            <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('description')} (EN)</label>
            <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" rows={3} maxLength={500} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('description')} (AR)</label>
            <textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" rows={3} maxLength={500} />
          </div>
          <Input label={t('imageUrl')} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          <Input label={t('eventDate')} type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving}>{t('cancel')}</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>{saving ? t('saving') : t('save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={viewRegs !== null} onClose={() => setViewRegs(null)} title={t('eventRegistrations')} className="max-w-md">
        {viewRegs && (
          <div className="space-y-3">
            {eventRegs(viewRegs).length === 0 ? (
              <p className="text-sm text-foreground-500 text-center py-6">{t('noRegistrations')}</p>
            ) : (
              eventRegs(viewRegs).map((reg) => (
                <div key={reg.id} className="flex items-center justify-between py-2 border-b border-background-200/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground-800">{reg.guest_name}</p>
                    <p className="text-xs text-foreground-400">{reg.guest_phone}</p>
                  </div>
                  <span className="text-xs text-foreground-400">{new Date(reg.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title={t('confirmDelete')}>
        <p className="text-sm text-foreground-600 mb-6">{t('confirmDeleteEventDesc')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
          <Button variant="danger" size="sm" onClick={() => deleteTarget && handleDelete(deleteTarget)}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminEvents() {
  return <AdminAuthGuard><AdminLayout><EventsContent /></AdminLayout></AdminAuthGuard>;
}