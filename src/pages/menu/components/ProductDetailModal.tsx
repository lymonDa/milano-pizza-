import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Addon {
  id: string;
  name_en: string;
  price: number;
}

interface Product {
  id: string;
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
}

function getBranchPrice(product: Product, size: 'M' | 'L', branch: Branch): number {
  if (branch === 'arabia') {
    const price = size === 'M' ? product.price_m_arabia : product.price_l_arabia;
    if (price != null) return Number(price);
  }
  if (branch === 'dahar') {
    const price = size === 'M' ? product.price_m_dahar : product.price_l_dahar;
    if (price != null) return Number(price);
  }
  return size === 'M' ? Number(product.base_price_m) : Number(product.base_price_l);
}

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { t } = useTranslation('common');
  const { addItem } = useCart();
  const { branch } = useBranch();
  const [selectedSize, setSelectedSize] = useState<'M' | 'L'>('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [addonsError, setAddonsError] = useState(false);

  useEffect(() => {
    if (!product) return;

    let cancelled = false;
    setAddonsLoading(true);
    setAddonsError(false);
    setAddons([]);
    setSelectedAddons([]);

    async function fetchAddons() {
      try {
        const { data, error } = await supabase
          .from('menu_item_addons')
          .select('id, name_en, price')
          .eq('menu_item_id', product!.id);

        if (error) throw error;

        if (!cancelled && data) {
          setAddons(data);
        }
      } catch {
        if (!cancelled) setAddonsError(true);
      } finally {
        if (!cancelled) setAddonsLoading(false);
      }
    }

    fetchAddons();
    return () => { cancelled = true; };
  }, [product]);

  const priceM = product ? getBranchPrice(product, 'M', branch) : 0;
  const priceL = product ? getBranchPrice(product, 'L', branch) : 0;
  const hasLarge = priceL > 0;
  const currentPrice = selectedSize === 'M' ? priceM : priceL;

  const addonTotal = selectedAddons.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const lineTotal = (currentPrice + addonTotal) * quantity;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (!product) return;
    const addonList = selectedAddons
      .map((id) => {
        const found = addons.find((a) => a.id === id);
        return found ? { id: found.id, name: found.name_en, price: found.price, quantity: 1 } : null;
      })
      .filter((item): item is { id: string; name: string; price: number; quantity: number } => item !== null);

    addItem({
      menuItemId: product.id,
      name: product.name_en,
      description: product.description_en,
      imageUrl: product.image_url,
      size: selectedSize,
      quantity,
      unitPrice: currentPrice,
      addons: addonList,
      lineTotal,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);

    setSelectedSize('M');
    setQuantity(1);
    setSelectedAddons([]);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div
        className="absolute inset-0 bg-foreground-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background-50 rounded-lg border border-background-200/70 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-background-50/90 text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <i className="ri-close-line text-lg" />
        </button>

        <div className="relative h-48 md:h-64 overflow-hidden rounded-t-lg">
          <img
            src={product.image_url}
            alt={product.name_en}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/40 to-transparent" />
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground-950 font-heading mb-2">
              {product.name_en}
            </h2>
            <p className="text-sm text-foreground-600 leading-relaxed">
              {product.description_en}
            </p>
          </div>

          {hasLarge && (
            <div>
              <label className="text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2 block">
                {t('size')}
              </label>
              <div className="flex gap-2">
                {(['M', 'L'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 border cursor-pointer whitespace-nowrap',
                      selectedSize === size
                        ? 'bg-primary-500 text-background-50 border-primary-500'
                        : 'bg-background-100 text-foreground-600 border-background-200/70 hover:border-primary-300'
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-semibold text-base">{size}</span>
                      <span className="text-xs opacity-80">
                        {size === 'M' ? priceM : priceL} EGP
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {addonsLoading && (
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-background-100 animate-pulse" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-background-100 animate-pulse" />
              ))}
            </div>
          )}

          {addonsError && (
            <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
              {t('couldNotLoadAddons')} <button onClick={() => {
                setAddonsError(false);
                setAddonsLoading(true);
                supabase.from('menu_item_addons').select('id, name_en, price').eq('menu_item_id', product.id).then(({ data, error }) => {
                  if (!error && data) setAddons(data);
                  setAddonsLoading(false);
                }).then(() => undefined, () => {
                  setAddonsError(true);
                  setAddonsLoading(false);
                });
              }} className="underline font-medium cursor-pointer">{t('retry')}</button>
            </div>
          )}

          {!addonsLoading && !addonsError && addons.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2 block">
                {t('addons')}
              </label>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-md border transition-all duration-200 text-left cursor-pointer',
                        isSelected
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-background-200/70 bg-background-50 hover:border-primary-200'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-background-300'
                          )}
                        >
                          {isSelected && <i className="ri-check-line text-xs text-background-50" />}
                        </span>
                        <span className={cn('text-sm', isSelected ? 'text-foreground-950 font-medium' : 'text-foreground-600')}>
                          {addon.name_en}
                        </span>
                      </div>
                      <span className={cn('text-sm font-medium', isSelected ? 'text-primary-700' : 'text-foreground-500')}>
                        +{addon.price} EGP
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground-700 uppercase tracking-wider mb-2 block">
              {t('quantity')}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-md border border-background-200/70 bg-background-100 text-foreground-700 hover:bg-background-200 transition-colors cursor-pointer"
              >
                <i className="ri-subtract-line text-lg" />
              </button>
              <span className="w-10 text-center text-base font-bold text-foreground-950">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-md border border-background-200/70 bg-background-100 text-foreground-700 hover:bg-background-200 transition-colors cursor-pointer"
              >
                <i className="ri-add-line text-lg" />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-background-200/70">
            <div className="flex items-center justify-between text-sm text-foreground-600">
              <span>{t('basePrice', { size: selectedSize })}</span>
              <span>{currentPrice * quantity} EGP</span>
            </div>
            {addonTotal > 0 && (
              <div className="flex items-center justify-between text-sm text-foreground-600">
                <span>{t('addons')}</span>
                <span>{addonTotal * quantity} EGP</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold text-foreground-950 font-heading pt-1">
              <span>{t('total')}</span>
              <span>{lineTotal} EGP</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className={cn(
              'w-full py-3.5 rounded-md font-semibold text-sm text-background-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
              added
                ? 'bg-primary-600'
                : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98]'
            )}
          >
            {added ? (
              <>
                <i className="ri-check-line text-lg" />
                {t('addedToCart')}
              </>
            ) : (
              <>
                <i className="ri-shopping-bag-3-line text-lg" />
                {t('addToCartWithPrice', { price: lineTotal })}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}