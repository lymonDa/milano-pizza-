import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  item_name_snapshot: string;
  size: string;
  unit_price: number;
  discounted_unit_price: number;
  quantity: number;
  line_total: number;
}

interface OrderItemsSummaryProps {
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
}

export function OrderItemsSummary({ items, subtotal, discountTotal, total }: OrderItemsSummaryProps) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground-900 font-heading">
        {t('orderItems')}
      </h4>

      <div className="divide-y divide-background-200/70">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground-800 truncate">
                {item.item_name_snapshot}
              </p>
              <p className="text-xs text-foreground-500 mt-0.5">
                {item.size === 'L' ? t('large') : item.size === 'M' ? t('medium') : t('small')}
                {' × '}
                {item.quantity}
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-medium text-foreground-900 whitespace-nowrap">
                {item.line_total} EGP
              </p>
              {item.discounted_unit_price < item.unit_price && (
                <p className="text-xs text-foreground-400 line-through whitespace-nowrap">
                  {item.unit_price * item.quantity} EGP
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-background-200/70 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm text-foreground-600">
          <span>{t('subtotal')}</span>
          <span>{subtotal} EGP</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-sm text-accent-600">
            <span>{t('discount')}</span>
            <span>-{discountTotal} EGP</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold text-foreground-950 pt-1 border-t border-background-200/70">
          <span>{t('total')}</span>
          <span>{total} EGP</span>
        </div>
      </div>
    </div>
  );
}