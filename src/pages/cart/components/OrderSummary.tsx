import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/base/Button';
import { useNavigate } from 'react-router-dom';

export function OrderSummary() {
  const { t } = useTranslation('common');
  const { items, subtotal, discount, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="bg-background-50 rounded-lg border border-background-200/70 p-4 md:p-5">
      <h3 className="text-base font-semibold text-foreground-950 mb-4">
        {t('orderSummary')}
      </h3>

      <div className="space-y-2 text-sm">
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
          <span className="text-primary-600 font-medium">{t('freeDelivery')}</span>
        </div>
        <div className="border-t border-background-200/70 pt-2 mt-2 flex justify-between">
          <span className="font-semibold text-foreground-950">{t('total')}</span>
          <span className="font-bold text-lg text-foreground-950">{total} EGP</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full mt-5"
        onClick={() => navigate('/checkout')}
      >
        {t('proceedToCheckout')}
        <span className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-right-line" />
        </span>
      </Button>
    </div>
  );
}