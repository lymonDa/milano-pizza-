import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/base/Button';
import { CartItemCard } from './components/CartItemCard';
import { OrderSummary } from './components/OrderSummary';

export default function Cart() {
  const { t } = useTranslation('common');
  const { items, clearCart } = useCart();

  return (
    <div className="min-h-screen pt-20 pb-14 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950">
              {t('cart')}
            </h1>
            {items.length > 0 && (
              <p className="text-sm text-foreground-500 mt-1">
                {items.length} {t('item_plural')}
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-foreground-500 hover:text-accent-600 transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-delete-bin-6-line" />
              </span>
              {t('clearCart')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-background-100 flex items-center justify-center mb-5">
              <i className="ri-shopping-bag-3-line text-3xl text-foreground-300" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground-800 mb-2">
              {t('cartEmpty')}
            </h2>
            <p className="text-sm text-foreground-500 max-w-xs mb-6">
              {t('cartEmptyDesc')}
            </p>
            <Link to="/menu">
              <Button variant="primary" size="lg">
                {t('startShopping')}
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart Content */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Items List */}
            <div className="flex-1 space-y-3">
              {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="lg:sticky lg:top-24">
                <OrderSummary />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}