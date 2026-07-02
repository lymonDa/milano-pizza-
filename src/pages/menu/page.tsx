import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuCard } from './components/MenuCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { useCart } from '@/contexts/CartContext';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  category_id: string;
  name_en: string;
  description_en: string;
  image_url: string;
  base_price_m: number;
  base_price_l: number;
  price_m_arabia: number | null;
  price_l_arabia: number | null;
  price_m_dahar: number | null;
  price_l_dahar: number | null;
  is_available: boolean;
  category_slug?: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function getBranchPrice(item: MenuItem, size: 'M' | 'L', branch: Branch): number {
  if (branch === 'arabia') {
    const price = size === 'M' ? item.price_m_arabia : item.price_l_arabia;
    if (price != null) return Number(price);
  }
  if (branch === 'dahar') {
    const price = size === 'M' ? item.price_m_dahar : item.price_l_dahar;
    if (price != null) return Number(price);
  }
  return size === 'M' ? Number(item.base_price_m) : Number(item.base_price_l);
}

export default function Menu() {
  const { t } = useTranslation('common');
  const { addItem } = useCart();
  const { branch } = useBranch();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMenu() {
      setLoading(true);
      setError(false);

      try {
        const { data, error: err } = await supabase
          .from('menu_items')
          .select('id, category_id, name_en, description_en, image_url, base_price_m, base_price_l, price_m_arabia, price_l_arabia, price_m_dahar, price_l_dahar, is_available, menu_categories!inner(name_en)')
          .order('name_en');

        if (err) throw err;

        if (!cancelled && data) {
          const mapped: MenuItem[] = (data as Array<{
            id: string;
            category_id: string;
            name_en: string;
            description_en: string;
            image_url: string;
            base_price_m: number;
            base_price_l: number;
            price_m_arabia: number | null;
            price_l_arabia: number | null;
            price_m_dahar: number | null;
            price_l_dahar: number | null;
            is_available: boolean;
            menu_categories: Array<{ name_en: string }> | { name_en: string } | null;
          }>).map((row) => ({
            id: row.id,
            category_id: row.category_id,
            name_en: row.name_en,
            description_en: row.description_en,
            image_url: row.image_url,
            base_price_m: row.base_price_m,
            base_price_l: row.base_price_l,
            price_m_arabia: row.price_m_arabia,
            price_l_arabia: row.price_l_arabia,
            price_m_dahar: row.price_m_dahar,
            price_l_dahar: row.price_l_dahar,
            is_available: row.is_available,
            category_slug: row.menu_categories
              ? slugify(Array.isArray(row.menu_categories) ? row.menu_categories[0]?.name_en ?? '' : row.menu_categories.name_en)
              : undefined,
          }));
          setItems(mapped);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category_slug === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name_en.toLowerCase().includes(q) ||
          item.description_en.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, activeCategory, searchQuery]);

  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      const price = getBranchPrice(item, 'M', branch);
      addItem({
        menuItemId: item.id,
        name: item.name_en,
        description: item.description_en,
        imageUrl: item.image_url,
        size: 'M',
        quantity: 1,
        unitPrice: price,
        addons: [],
        lineTotal: price,
      });
    },
    [addItem, branch]
  );

  const categoryName = useMemo(() => {
    if (activeCategory === 'all') return t('menu');
    const first = items.find((i) => i.category_slug === activeCategory);
    return first?.name_en || t('menu');
  }, [activeCategory, items, t]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-6 space-y-3">
            <div className="h-4 w-32 rounded bg-background-100 animate-pulse" />
            <div className="h-8 w-48 rounded bg-background-100 animate-pulse" />
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 rounded-full bg-background-100 animate-pulse shrink-0" />
            ))}
          </div>
          <div className="h-10 w-full rounded-md bg-background-100 animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-background-200/70 overflow-hidden">
                <div className="h-44 bg-background-100 animate-pulse" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-3/4 rounded bg-background-100 animate-pulse" />
                  <div className="h-3 w-full rounded bg-background-100 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-background-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-10 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground-700 mb-1">{t('failedToLoadMenu')}</h3>
          <p className="text-sm text-foreground-500 mb-4">{t('menuLoadError')}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
          >
            <i className="ri-refresh-line text-sm w-4 h-4 flex items-center justify-center" />
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2 block">
              {t('freshFromTheOven')}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
              {categoryName}
            </h1>
            <p className="text-sm text-foreground-500 mt-1">
              {filteredItems.length} {t('item_plural')}
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-background-50 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-shopping-bag-3-line text-lg w-5 h-5 flex items-center justify-center" />
            {t('cart')}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-foreground-400">
            <i className="ri-search-line text-lg" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchMenuItems')}
            className="w-full pl-10 pr-4 py-2.5 bg-background-100 border border-background-200/70 rounded-md text-sm text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-foreground-400 hover:text-foreground-600 cursor-pointer"
            >
              <i className="ri-close-line text-lg" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-foreground-500">
              {filteredItems.length} {t(filteredItems.length === 1 ? 'resultsCount_one' : 'resultsCount_other', { count: filteredItems.length })}
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredItems.map((item) => {
              const priceM = getBranchPrice(item, 'M', branch);
              const priceL = getBranchPrice(item, 'L', branch);
              return (
                <MenuCard
                  key={item.id}
                  name={item.name_en}
                  description={item.description_en}
                  price_m={priceM}
                  price_l={priceL}
                  image_url={item.image_url}
                  is_available={item.is_available}
                  onClick={() => setSelectedProduct(item)}
                  onAdd={() => handleQuickAdd(item)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-100 flex items-center justify-center">
              <i className="ri-search-line text-2xl text-foreground-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground-700 mb-1">
              {t('noMenuItemsFound')}
            </h3>
            <p className="text-sm text-foreground-500 mb-4">
              {t('adjustSearchOrFilters')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            >
              <i className="ri-refresh-line text-sm w-4 h-4 flex items-center justify-center" />
              {t('clearAllFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MenuItemList',
            '@id': `${import.meta.env.VITE_SITE_URL}/menu#menu`,
            name: 'Milano Pizza Menu',
            description: 'Browse our full menu of authentic wood-fired Italian pizzas, pastas, and more. Available at our Arabia and Dahar branches in Hurghada.',
            url: `${import.meta.env.VITE_SITE_URL}/menu`,
            hasMenuItem: filteredItems.slice(0, 20).map((item) => ({
              '@type': 'MenuItem',
              name: item.name_en,
              description: item.description_en || '',
              image: item.image_url,
              offers: {
                '@type': 'Offer',
                availability: item.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                priceCurrency: 'EGP',
              },
            })),
          }),
        }}
      />
    </div>
  );
}