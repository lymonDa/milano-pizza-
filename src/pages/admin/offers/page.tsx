import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Modal } from '@/components/base/Modal';

interface Offer {
  id: string;
  title_ar: string;
  title_en: string;
  discount_type: string;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  linked_items: string[];
}

interface MenuItem {
  id: string;
  name: string;
}

function OffersContent() {
  const { t } = useTranslation('common');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState({
    title_ar: '', title_en: '', discount_type: 'percentage', discount_value: 0,
    starts_at: '', ends_at: '', linked_items: [] as string[],
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [offRes, menuRes] = await Promise.all([
        supabase.from('offers').select('*').order('created_at', { ascending: false }),
        supabase.from('menu_items').select('id, name').order('name'),
      ]);

      if (offRes.error) throw new Error(offRes.error.message);
      if (menuRes.error) throw new Error(menuRes.error.message);

      const offs = offRes.data || [];
      const items = menuRes.data || [];

      const { data: oiData, error: oiErr } = await supabase.from('offer_items').select('offer_id, menu_item_id');
      if (oiErr) throw new Error(oiErr.message);

      const linkedMap: Record<string, string[]> = {};
      (oiData || []).forEach((oi: { offer_id: string; menu_item_id: string }) => {
        if (!linkedMap[oi.offer_id]) linkedMap[oi.offer_id] = [];
        linkedMap[oi.offer_id].push(oi.menu_item_id);
      });

      setOffers(offs.map((o: Record<string, unknown>) => ({
        id: o.id as string,
        title_ar: o.title_ar as string || '',
        title_en: o.title_en as string || '',
        discount_type: o.discount_type as string,
        discount_value: o.discount_value as number,
        starts_at: o.starts_at as string,
        ends_at: o.ends_at as string,
        created_at: o.created_at as string,
        linked_items: linkedMap[o.id as string] || [],
      })));
      setMenuItems(items as MenuItem[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const now = new Date();
  const isActive = (o: Offer) => new Date(o.starts_at) <= now && new Date(o.ends_at) >= now;

  const openAdd = () => {
    setEditingOffer(null);
    setForm({ title_ar: '', title_en: '', discount_type: 'percentage', discount_value: 0, starts_at: '', ends_at: '', linked_items: [] });
    setModalOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditingOffer(o);
    setForm({
      title_ar: o.title_ar, title_en: o.title_en, discount_type: o.discount_type,
      discount_value: o.discount_value, starts_at: o.starts_at.slice(0, 16),
      ends_at: o.ends_at.slice(0, 16), linked_items: o.linked_items,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title_en.trim()) return;
    setSaving(true);
    try {
      const offerPayload = {
        title_ar: form.title_ar,
        title_en: form.title_en,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      };

      let offerId = editingOffer?.id;

      if (editingOffer) {
        const { error: updErr } = await supabase.from('offers').update(offerPayload).eq('id', editingOffer.id);
        if (updErr) throw new Error(updErr.message);
        await supabase.from('offer_items').delete().eq('offer_id', editingOffer.id);
      } else {
        const { data: insData, error: insErr } = await supabase.from('offers').insert(offerPayload).select('id').single();
        if (insErr) throw new Error(insErr.message);
        offerId = (insData as { id: string }).id;
      }

      if (offerId && form.linked_items.length > 0) {
        const oiRows = form.linked_items.map((menu_item_id) => ({ offer_id: offerId, menu_item_id }));
        const { error: oiErr } = await supabase.from('offer_items').insert(oiRows);
        if (oiErr) throw new Error(oiErr.message);
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
      await supabase.from('offer_items').delete().eq('offer_id', id);
      const { error: delErr } = await supabase.from('offers').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleItem = (itemId: string) => {
    setForm((prev) => ({
      ...prev,
      linked_items: prev.linked_items.includes(itemId)
        ? prev.linked_items.filter((i) => i !== itemId)
        : [...prev.linked_items, itemId],
    }));
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
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('offers')}</h1>
          <p className="text-sm text-foreground-500 mt-0.5">{offers.length} {t('offer').toLowerCase()}s</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <i className="ri-add-line" />{t('addOffer')}
        </Button>
      </div>

      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('offer')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('discount')}</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('period')}</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('status')}</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('linkedProducts')}</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-foreground-800">{o.title_en}</p>
                    <p className="text-xs text-foreground-400">{o.title_ar}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-accent-600">
                      {o.discount_type === 'percentage' ? `${o.discount_value}%` : `${o.discount_value} EGP`}
                    </span>
                    <span className="text-xs text-foreground-400 ml-1">{t(o.discount_type)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs text-foreground-600 whitespace-nowrap">
                      {new Date(o.starts_at).toLocaleDateString()} — {new Date(o.ends_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                      isActive(o) ? 'bg-primary-100 text-primary-700' : 'bg-background-200 text-foreground-500'
                    )}>
                      {isActive(o) ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-foreground-500">{o.linked_items.length} {t('items')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(o)} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                        <i className="ri-edit-line text-sm" />
                      </button>
                      <button onClick={() => setDeleteTarget(o.id)} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer">
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingOffer ? t('editOffer') : t('addOffer')} className="max-w-lg">
        <div className="space-y-4">
          <Input label={`${t('name')} (EN)`} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Large Pizza Deal" required />
          <Input label={`${t('name')} (AR)`} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder="عرض البيتزا الكبيرة" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('discountType')}</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                <option value="percentage">{t('percentage')}</option>
                <option value="fixed">{t('fixed')}</option>
              </select>
            </div>
            <Input label={t('discountValue')} type="number" value={form.discount_value || ''} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} placeholder="20" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('startsAt')} type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required />
            <Input label={t('endsAt')} type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-800 mb-2">{t('linkedProducts')}</label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-background-300/60 rounded-md p-2">
              {menuItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-background-50 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.linked_items.includes(item.id)} onChange={() => toggleItem(item.id)} className="w-4 h-4 rounded accent-primary-500 cursor-pointer" />
                  <span className="text-foreground-700 truncate">{item.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving}>{t('cancel')}</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>{saving ? t('saving') : t('save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title={t('confirmDelete')}>
        <p className="text-sm text-foreground-600 mb-6">{t('confirmDeleteOfferDesc')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
          <Button variant="danger" size="sm" onClick={() => deleteTarget && handleDelete(deleteTarget)}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminOffers() {
  return <AdminAuthGuard><AdminLayout><OffersContent /></AdminLayout></AdminAuthGuard>;
}