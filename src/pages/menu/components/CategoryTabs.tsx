import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface MenuCategory {
  id: string;
  name_en: string;
  slug: string;
  icon: string;
}

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

const ICON_MAP: Record<string, string> = {
  pizza: 'ri-cake-3-line',
  pasta: 'ri-bowl-line',
  appetizers: 'ri-restaurant-line',
  salads: 'ri-seedling-line',
  desserts: 'ri-cake-line',
  beverages: 'ri-cup-line',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { t } = useTranslation('common');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('menu_categories')
          .select('id, name_en')
          .order('sort_order');

        if (error) throw error;

        if (!cancelled && data) {
          const mapped: MenuCategory[] = data.map((cat: { id: string; name_en: string }) => {
            const slug = slugify(cat.name_en);
            return {
              id: cat.id,
              name_en: cat.name_en,
              slug,
              icon: ICON_MAP[slug] || 'ri-restaurant-line',
            };
          });
          setCategories(mapped);
        }
      } catch {
        // silently handle — tabs will just show "All"
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const allTab = { id: 'all', name_en: t('all'), slug: 'all', icon: 'ri-apps-line' };
  const tabs = [allTab, ...categories];

  if (loading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-background-100 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
      {tabs.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer snap-start shrink-0',
              isActive
                ? 'bg-primary-500 text-background-50 shadow-sm'
                : 'bg-background-100 text-foreground-600 hover:bg-background-200 border border-background-200/70'
            )}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <i className={cn(cat.icon, 'text-base')} />
            </span>
            {cat.name_en}
          </button>
        );
      })}
    </div>
  );
}