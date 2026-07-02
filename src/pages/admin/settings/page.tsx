import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/base/Button';

interface Setting {
  key: string;
  value: { label: string; val: string };
}

function SettingsContent() {
  const { t } = useTranslation('common');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');
      if (err) throw new Error(err.message);
      setSettings((data || []) as Setting[]);
    } catch (er: unknown) {
      setError(er instanceof Error ? er.message : String(er));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = (s: Setting) => {
    setEditingKey(s.key);
    setEditValue(String(s.value?.val ?? ''));
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      const target = settings.find((s) => s.key === key);
      if (!target) return;
      const newValue = { ...target.value, val: editValue };
      const { error: upsErr } = await supabase.from('site_settings').upsert({ key, value: newValue }, { onConflict: 'key' });
      if (upsErr) throw new Error(upsErr.message);

      setSettings(settings.map((s) => (s.key === key ? { ...s, value: newValue } : s)));
      setEditingKey(null);
      setSavedMsg(t('settingsSaved'));
      setTimeout(() => setSavedMsg(''), 2000);
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
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('settings')}</h1>
          <p className="text-sm text-foreground-500 mt-0.5">{settings.length} {t('settings').toLowerCase()}</p>
        </div>
        {savedMsg && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
            <i className="ri-check-line" />{savedMsg}
          </span>
        )}
      </div>

      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-background-200/70 bg-background-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('setting')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('value')}</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider w-20">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.key} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-foreground-800">{s.value?.label || s.key}</span>
                  <p className="text-[10px] font-mono text-foreground-400">{s.key}</p>
                </td>
                <td className="py-3 px-4">
                  {editingKey === s.key ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-primary-300 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  ) : (
                    <span className="text-sm text-foreground-700">{String(s.value?.val ?? '')}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {editingKey === s.key ? (
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditingKey(null)} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-foreground-600 rounded-md transition-colors cursor-pointer">
                        <i className="ri-close-line text-sm" />
                      </button>
                      <button onClick={() => handleSave(s.key)} disabled={saving} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                        <i className="ri-check-line text-sm" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(s)} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                      <i className="ri-edit-line text-sm" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return <AdminAuthGuard><AdminLayout><SettingsContent /></AdminLayout></AdminAuthGuard>;
}