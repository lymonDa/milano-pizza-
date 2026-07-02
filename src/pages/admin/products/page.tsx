import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Input } from '@/components/base/Input';
import { Button } from '@/components/base/Button';
import { Modal } from '@/components/base/Modal';

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  base_price_m: number;
  base_price_l: number;
  is_available: boolean;
  price_m_arabia: number | null;
  price_l_arabia: number | null;
  price_m_dahar: number | null;
  price_l_dahar: number | null;
}

type TabKey = 'items' | 'categories';

function ProductsContent() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabKey>('items');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name_en: '', name_ar: '', sort_order: 1 });

  // Item modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category_id: '',
    base_price_m: 0,
    base_price_l: 0,
    image_url: '',
    price_m_arabia: '' as string,
    price_l_arabia: '' as string,
    price_m_dahar: '' as string,
    price_l_dahar: '' as string,
  });

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'item' | 'category'; id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: catData }, { data: itemData }] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('menu_items').select('*').order('created_at', { ascending: false }),
      ]);
      setCategories((catData || []) as Category[]);
      setItems((itemData || []) as MenuItem[]);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name_en || catId;

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = searchQuery === '' || item.name_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Category handlers
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ name_en: '', name_ar: '', sort_order: categories.length + 1 });
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ name_en: cat.name_en, name_ar: cat.name_ar, sort_order: cat.sort_order });
    setCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name_en.trim() || !catForm.name_ar.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await supabase.from('menu_categories').update(catForm).eq('id', editingCategory.id);
      } else {
        await supabase.from('menu_categories').insert(catForm);
      }
      await fetchData();
    } catch {
      // silently handle
    } finally {
      setSaving(false);
      setCatModalOpen(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await supabase.from('menu_categories').delete().eq('id', id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch {
      // silently handle
    }
    setDeleteTarget(null);
  };

  // Item handlers
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category_id: categories[0]?.id || '',
      base_price_m: 0,
      base_price_l: 0,
      image_url: '',
      price_m_arabia: '',
      price_l_arabia: '',
      price_m_dahar: '',
      price_l_dahar: '',
    });
    setItemModalOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name_en: item.name_en,
      name_ar: item.name_ar,
      description_en: item.description_en || '',
      description_ar: item.description_ar || '',
      category_id: item.category_id,
      base_price_m: item.base_price_m,
      base_price_l: item.base_price_l,
      image_url: item.image_url || '',
      price_m_arabia: item.price_m_arabia != null ? String(item.price_m_arabia) : '',
      price_l_arabia: item.price_l_arabia != null ? String(item.price_l_arabia) : '',
      price_m_dahar: item.price_m_dahar != null ? String(item.price_m_dahar) : '',
      price_l_dahar: item.price_l_dahar != null ? String(item.price_l_dahar) : '',
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.name_en.trim()) return;
    setSaving(true);
    try {
      const data = {
        name_en: itemForm.name_en,
        name_ar: itemForm.name_ar,
        description_en: itemForm.description_en,
        description_ar: itemForm.description_ar,
        category_id: itemForm.category_id,
        base_price_m: itemForm.base_price_m,
        base_price_l: itemForm.base_price_l,
        image_url: itemForm.image_url,
        is_available: editingItem?.is_available ?? true,
        price_m_arabia: itemForm.price_m_arabia !== '' ? Number(itemForm.price_m_arabia) : null,
        price_l_arabia: itemForm.price_l_arabia !== '' ? Number(itemForm.price_l_arabia) : null,
        price_m_dahar: itemForm.price_m_dahar !== '' ? Number(itemForm.price_m_dahar) : null,
        price_l_dahar: itemForm.price_l_dahar !== '' ? Number(itemForm.price_l_dahar) : null,
      };
      if (editingItem) {
        await supabase.from('menu_items').update(data).eq('id', editingItem.id);
      } else {
        await supabase.from('menu_items').insert(data);
      }
      await fetchData();
    } catch {
      // silently handle
    } finally {
      setSaving(false);
      setItemModalOpen(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await supabase.from('menu_items').delete().eq('id', id);
      setItems(items.filter((i) => i.id !== id));
    } catch {
      // silently handle
    }
    setDeleteTarget(null);
  };

  const toggleItemAvailability = async (id: string) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const newVal = !item.is_available;
      setItems(items.map((i) => (i.id === id ? { ...i, is_available: newVal } : i)));
      await supabase.from('menu_items').update({ is_available: newVal }).eq('id', id);
    } catch {
      await fetchData(); // revert on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCategories = categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground-950">
            {t('menuManagement')}
          </h1>
          <p className="text-sm text-foreground-500 mt-0.5">
            {t('menuManagementDesc')}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={activeTab === 'items' ? openAddItem : openAddCategory}>
          <i className="ri-add-line" />
          {activeTab === 'items' ? t('addProduct') : t('addCategory')}
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-background-100 border border-background-200/70 rounded-full w-fit">
        {([
          { key: 'items' as TabKey, label: 'products' },
          { key: 'categories' as TabKey, label: 'categories' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-primary-500 text-background-50'
                : 'text-foreground-600 hover:text-foreground-800'
            )}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* ITEMS TAB */}
      {activeTab === 'items' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder={`${t('search')} ${t('products').toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
                  selectedCategory === 'all'
                    ? 'bg-foreground-900 text-background-50'
                    : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
                )}
              >
                {t('all')}
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap',
                    selectedCategory === cat.id
                      ? 'bg-foreground-900 text-background-50'
                      : 'bg-background-100 text-foreground-600 hover:text-foreground-800 border border-background-200/70'
                  )}
                >
                  {cat.name_en}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-200/70 bg-background-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {t('product')}
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {t('category')}
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {t('price')} (M/L)
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      {t('branchPricingShort')}
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-background-200 overflow-hidden shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name_en}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-foreground-400">
                                <i className="ri-restaurant-line text-sm" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground-800 truncate max-w-[200px]">
                              {item.name_en}
                            </p>
                            {item.name_ar && (
                              <p className="text-[10px] text-foreground-400 truncate max-w-[200px]">{item.name_ar}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-foreground-600 whitespace-nowrap">
                          {getCategoryName(item.category_id)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs text-foreground-700 whitespace-nowrap">
                          {item.base_price_m > 0 ? `${item.base_price_m} EGP` : '\u2014'}
                          {item.base_price_l > 0 ? ` / ${item.base_price_l} EGP` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.price_m_arabia != null || item.price_l_arabia != null ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70 whitespace-nowrap cursor-default">
                              {t('branchArabiaShort')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-background-100 text-foreground-400 border border-background-200/70 whitespace-nowrap cursor-default">
                              {t('branchArabiaShort')}
                            </span>
                          )}
                          {item.price_m_dahar != null || item.price_l_dahar != null ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap cursor-default">
                              {t('branchDaharShort')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-background-100 text-foreground-400 border border-background-200/70 whitespace-nowrap cursor-default">
                              {t('branchDaharShort')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap transition-colors',
                            item.is_available
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-accent-50 text-accent-600'
                          )}
                        >
                          {item.is_available ? t('available') : t('unavailable')}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditItem(item)}
                            className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer"
                            title={t('edit')}
                          >
                            <i className="ri-edit-line text-sm" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'item', id: item.id })}
                            className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer"
                            title={t('delete')}
                          >
                            <i className="ri-delete-bin-line text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-foreground-500">{t('noProductsFound')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="bg-background-100 border border-background-200/70 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('arabicName')}
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('sortOrder')}
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {activeCategories.map((cat) => (
                <tr key={cat.id} className="border-b border-background-200/50 hover:bg-background-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-foreground-800">{cat.name_en}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground-500">{cat.name_ar}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-foreground-600">{cat.sort_order}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors cursor-pointer"
                        title={t('edit')}
                      >
                        <i className="ri-edit-line text-sm" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'category', id: cat.id })}
                        className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors cursor-pointer"
                        title={t('delete')}
                      >
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? t('editCategory') : t('addCategory')}
      >
        <div className="space-y-4">
          <Input
            label={`${t('name')} (EN)`}
            value={catForm.name_en}
            onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
            placeholder="Pizza"
            required
          />
          <Input
            label={`${t('name')} (AR)`}
            value={catForm.name_ar}
            onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })}
            placeholder="بيتزا"
            required
          />
          <Input
            label={t('sortOrder')}
            type="number"
            value={catForm.sort_order || ''}
            onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })}
            placeholder="1"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCatModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCategory} isLoading={saving}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? t('editProduct') : t('addProduct')}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <Input
            label={`${t('name')} (EN)`}
            value={itemForm.name_en}
            onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
            placeholder="Margherita Classica"
            required
          />
          <Input
            label={`${t('name')} (AR)`}
            value={itemForm.name_ar}
            onChange={(e) => setItemForm({ ...itemForm, name_ar: e.target.value })}
            placeholder="مارجريتا كلاسيك"
          />
          <div>
            <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('category')}</label>
            <select
              value={itemForm.category_id}
              onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
            >
              <option value="" disabled>{t('selectCategory')}</option>
              {activeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_en}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`${t('price')} (M)`}
              type="number"
              value={itemForm.base_price_m || ''}
              onChange={(e) => setItemForm({ ...itemForm, base_price_m: Number(e.target.value) })}
              placeholder="0"
            />
            <Input
              label={`${t('price')} (L)`}
              type="number"
              value={itemForm.base_price_l || ''}
              onChange={(e) => setItemForm({ ...itemForm, base_price_l: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          {/* Branch Pricing */}
          <div className="border border-secondary-200/70 rounded-lg p-4 bg-secondary-50/50">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-map-pin-line text-secondary-600" />
              <span className="text-sm font-semibold font-heading text-foreground-900">{t('branchPricing')}</span>
            </div>
            <p className="text-xs text-foreground-500 mb-4">{t('usesBasePriceIfEmpty')}</p>

            {/* Arabia Branch */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-foreground-700">{t('branchArabia')}</span>
                <span className="text-[10px] text-foreground-400">{'\u2014'} {t('branchArabiaDesc')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`${t('price')} (M)`}
                  type="number"
                  value={itemForm.price_m_arabia}
                  onChange={(e) => setItemForm({ ...itemForm, price_m_arabia: e.target.value })}
                  placeholder={String(itemForm.base_price_m || 0)}
                />
                <Input
                  label={`${t('price')} (L)`}
                  type="number"
                  value={itemForm.price_l_arabia}
                  onChange={(e) => setItemForm({ ...itemForm, price_l_arabia: e.target.value })}
                  placeholder={String(itemForm.base_price_l || 0)}
                />
              </div>
            </div>

            {/* Dahar Branch */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-foreground-700">{t('branchDahar')}</span>
                <span className="text-[10px] text-foreground-400">{'\u2014'} {t('branchDaharDesc')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`${t('price')} (M)`}
                  type="number"
                  value={itemForm.price_m_dahar}
                  onChange={(e) => setItemForm({ ...itemForm, price_m_dahar: e.target.value })}
                  placeholder={String(itemForm.base_price_m || 0)}
                />
                <Input
                  label={`${t('price')} (L)`}
                  type="number"
                  value={itemForm.price_l_dahar}
                  onChange={(e) => setItemForm({ ...itemForm, price_l_dahar: e.target.value })}
                  placeholder={String(itemForm.base_price_l || 0)}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('description')} (EN)</label>
            <textarea
              value={itemForm.description_en}
              onChange={(e) => setItemForm({ ...itemForm, description_en: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              rows={3}
              placeholder={t('productDescriptionPlaceholder')}
              maxLength={500}
            />
          </div>
          <Input
            label={t('imageUrl')}
            value={itemForm.image_url}
            onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setItemModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveItem} isLoading={saving}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t('confirmDelete')}
      >
        <p className="text-sm text-foreground-600 mb-6">
          {t('confirmDeleteDesc')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
            {t('cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (deleteTarget?.type === 'item') handleDeleteItem(deleteTarget.id);
              else if (deleteTarget?.type === 'category') handleDeleteCategory(deleteTarget.id);
            }}
          >
            {t('delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <ProductsContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}