import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';

export function ReviewStep() {
  const { t } = useTranslation('common');
  const { items, subtotal, discount, total } = useCart();

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground-950 mb-4">
        {t('reviewOrder')}
      </h2>

      {/* Items */}
      <div className="space-y-2 mb-5">
        {items.map((item) => {
          const addonStr = item.addons.map((a) => `${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}`).join(', ');
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-background-50 rounded-lg border border-background-200/70"
            >
              <div className="w-14 h-14 rounded-md overflow-hidden bg-background-100 shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-foreground-500">
                      {item.size === 'M' ? t('medium') : t('large')}
                      {addonStr && ` + ${addonStr}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground-900 ml-2 shrink-0">
                    {item.lineTotal} EGP
                  </span>
                </div>
                <span className="text-xs text-foreground-400">
                  {item.unitPrice} EGP &times; {item.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-background-200/70 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-foreground-600">
          <span>{t('subtotal')}</span>
          <span>{subtotal} EGP</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent-600">
            <span>{t('discount')}</span>
            <span>-{discount} EGP</span>
          </div>
        )}
        <div className="flex justify-between text-foreground-500">
          <span>{t('delivery')}</span>
          <span className="text-primary-600">{t('freeDelivery')}</span>
        </div>
        <div className="flex justify-between border-t border-background-200/70 pt-2 text-base">
          <span className="font-semibold text-foreground-950">{t('total')}</span>
          <span className="font-bold text-foreground-950">{total} EGP</span>
        </div>
      </div>
    </div>
  );
}