import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/base/Input';
import { Button } from '@/components/base/Button';
import { Modal } from '@/components/base/Modal';

interface Address {
  id: string;
  label: string;
  address_text: string;
  area: string;
  is_default: boolean;
}

const emptyAddress: Address = {
  id: '',
  label: '',
  address_text: '',
  area: '',
  is_default: false,
};

export function AddressesTab() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address>(emptyAddress);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      setAddresses((data || []) as Address[]);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress({ ...emptyAddress });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress({ ...addr });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingAddress.label.trim() || !editingAddress.address_text.trim() || !editingAddress.area.trim()) return;
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        label: editingAddress.label,
        address_text: editingAddress.address_text,
        area: editingAddress.area,
        is_default: editingAddress.is_default,
        user_id: user.id,
      };

      if (isEditing) {
        await supabase.from('addresses').update(payload).eq('id', editingAddress.id);
      } else {
        await supabase.from('addresses').insert(payload);
      }
      await fetchAddresses();
    } catch {
      // silently handle
    } finally {
      setSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('addresses').delete().eq('id', id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch {
      // silently handle
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const prevDefault = addresses.find((a) => a.is_default);
      if (prevDefault) {
        setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
        await Promise.all([
          supabase.from('addresses').update({ is_default: false }).eq('id', prevDefault.id),
          supabase.from('addresses').update({ is_default: true }).eq('id', id),
        ]);
      } else {
        setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
        await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      }
    } catch {
      await fetchAddresses();
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground-900 font-heading">
          {t('savedAddresses')}
        </h3>
        <Button variant="outline" size="sm" onClick={handleOpenAdd}>
          <i className="ri-add-line" />
          {t('addAddress')}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-background-100 border border-background-200/70 rounded-lg">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background-200 flex items-center justify-center">
            <i className="ri-map-pin-line text-foreground-400 text-xl" />
          </div>
          <p className="text-sm font-medium text-foreground-800">{t('noAddresses')}</p>
          <p className="text-xs text-foreground-500 mt-1">{t('noAddressesDesc')}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={handleOpenAdd}>
            <i className="ri-add-line" />
            {t('addAddress')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-background-100 border border-background-200/70 rounded-lg p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground-900 truncate">
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium bg-primary-100 text-primary-700 rounded-full whitespace-nowrap">
                      {t('default')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-700">{addr.address_text}</p>
                <p className="text-xs text-foreground-500 mt-0.5">{addr.area}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer"
                    title={t('setAsDefault')}
                  >
                    <i className="ri-star-line text-sm" />
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-foreground-700 hover:bg-background-200 rounded-md transition-colors cursor-pointer"
                  title={t('edit')}
                >
                  <i className="ri-edit-line text-sm" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer"
                  title={t('delete')}
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? t('editAddress') : t('addAddress')}
      >
        <div className="space-y-4">
          <Input
            label={t('label')}
            value={editingAddress.label}
            onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
            placeholder={t('home')}
            required
          />
          <Input
            label={t('streetLabel')}
            value={editingAddress.address_text}
            onChange={(e) => setEditingAddress({ ...editingAddress, address_text: e.target.value })}
            placeholder={t('addressPlaceholder')}
            required
          />
          <Input
            label={t('area')}
            value={editingAddress.area}
            onChange={(e) => setEditingAddress({ ...editingAddress, area: e.target.value })}
            placeholder={t('areaPlaceholder')}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}