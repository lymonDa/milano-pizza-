import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';

interface ContentItem {
  id: string;
  page_key: string;
  section_key: string;
  value_ar: string;
  value_en: string;
  value_it: string;
  value_ru: string;
  value_de: string;
  image_url: string;
}

const locales: { key: keyof Pick<ContentItem, 'value_ar' | 'value_en' | 'value_it' | 'value_ru' | 'value_de'>; label: string }[] = [
  { key: 'value_en', label: 'English' },
  { key: 'value_ar', label: 'العربية' },
  { key: 'value_it', label: 'Italiano' },
  { key: 'value_de', label: 'Deutsch' },
  { key: 'value_ru', label: 'Русский' },
];

const allPageKeys = ['home', 'about', 'contact', 'menu'];

function ContentContent() {
  const { t } = useTranslation('common');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeLocale, setActiveLocale] = useState<string>('value_en');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editImage, setEditImage] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const pageKeys = allPageKeys.filter((pk) => content.some((c) => c.page_key === pk));
  if (pageKeys.length === 0) allPageKeys.forEach((pk) => pageKeys.push(pk));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('site_content')
        .select('*')
        .order('page_key')
        .order('section_key');
      if (err) throw new Error(err.message);
      setContent((data || []) as ContentItem[]);
    } catch (er: unknown) {
      setError(er instanceof Error ? er.message : String(er));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pageContent = content.filter((c) => c.page_key === activeTab);

  const startEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditValue(item[activeLocale as keyof Pick<ContentItem, 'value_ar' | 'value_en' | 'value_it' | 'value_ru' | 'value_de'>] || '');
    setEditImage(item.image_url || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditImage('');
  };

  const handleSave = async (item: ContentItem) => {
    setSaving(true);
    try {
      const patch: Record<string, string> = { [activeLocale]: editValue, image_url: editImage };
      const { error: updErr } = await supabase.from('site_content').update(patch).eq('id', item.id);
      if (updErr) throw new Error(updErr.message);

      setContent(content.map((c) => (c.id !== item.id ? c : { ...c, [activeLocale]: editValue, image_url: editImage })));
      setEditingId(null);
      setSavedMsg(t('contentSaved'));
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
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">{t('content')}</h1>
          <p className="text-sm text-foreground-500 mt-0.5">{content.length} {t('content').toLowerCase()} {t('entries').toLowerCase()}</p>
        </div>
        {savedMsg && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
            <i className="ri-check-line" />{savedMsg}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 bg-background-100 border border-background-200/70 rounded-full w-fit">
        {pageKeys.map((pk) => (
          <button
            key={pk}
            onClick={() => { setActiveTab(pk); setEditingId(null); }}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap capitalize',
              activeTab === pk ? 'bg-primary-500 text-background-50' : 'text-foreground-600 hover:text-foreground-800'
            )}
          >
            {t(pk)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {locales.map((loc) => (
          <button
            key={loc.key}
            onClick={() => { setActiveLocale(loc.key); setEditingId(null); }}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
              activeLocale === loc.key
                ? 'bg-foreground-900 text-background-50'
                : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
            )}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-background-200/70 bg-background-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider w-1/4">{t('section')}</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">{t('value')}</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider w-20">{t('image')}</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider w-20">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pageContent.map((item) => {
              const val = item[activeLocale as keyof Pick<ContentItem, 'value_ar' | 'value_en' | 'value_it' | 'value_ru' | 'value_de'>] || '';
              return (
                <tr key={item.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono text-foreground-500 bg-background-200 px-2 py-0.5 rounded">{item.section_key}</span>
                  </td>
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-md border border-primary-300 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <Input
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder={t('imageUrlOptional')}
                          className="text-xs"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-foreground-700">{val || <span className="text-foreground-400 italic">{t('empty')}</span>}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.image_url ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary-600">
                        <i className="ri-image-line" />{t('yes')}
                      </span>
                    ) : (
                      <span className="text-xs text-foreground-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={cancelEdit} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-foreground-600 rounded-md transition-colors cursor-pointer">
                          <i className="ri-close-line text-sm" />
                        </button>
                        <button onClick={() => handleSave(item)} disabled={saving} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                          <i className="ri-check-line text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer">
                        <i className="ri-edit-line text-sm" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pageContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-foreground-500">{t('noContent')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminContent() {
  return <AdminAuthGuard><AdminLayout><ContentContent /></AdminLayout></AdminAuthGuard>;
}