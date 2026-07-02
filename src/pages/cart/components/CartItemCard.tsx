import { useTranslation } from 'react-i18next';
import { useCart, type CartItem } from '@/contexts/CartContext';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { t } = useTranslation('common');
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 md:gap-4 p-3 md:p-4 bg-background-50 rounded-lg border border-background-200/70">
      {/* Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-md overflow-hidden bg-background-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-foreground-950 truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-ruler-line text-xs" />
                </span>
                {item.size === 'M' ? t('medium') : t('large')}
              </span>
              {item.addons.length > 0 && (
                <span className="text-foreground-400">&middot;</span>
              )}
              {item.addons.map((a) => (
                <span key={a.id} className="text-foreground-500">
                  +{a.name}
                  {a.quantity > 1 && ` ×${a.quantity}`}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-foreground-400 hover:text-accent-500 hover:bg-accent-50 transition-colors shrink-0 cursor-pointer"
            aria-label={t('removeItem')}
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>

        {/* Price + Quantity */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-background-300/60 rounded-md">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-foreground-500 hover:text-foreground-800 hover:bg-background-100 transition-colors rounded-l-md cursor-pointer"
              aria-label={t('decreaseQuantity')}
            >
              <i className="ri-subtract-line text-sm" />
            </button>
            <span className="w-9 h-8 flex items-center justify-center text-sm font-medium text-foreground-900 border-x border-background-300/60">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-foreground-500 hover:text-foreground-800 hover:bg-background-100 transition-colors rounded-r-md cursor-pointer"
              aria-label={t('increaseQuantity')}
            >
              <i className="ri-add-line text-sm" />
            </button>
          </div>
          <span className="text-sm font-semibold text-foreground-950">
            {item.lineTotal} EGP
          </span>
        </div>
      </div>
    </div>
  );
}