import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/base/Badge';
import { cn } from '@/lib/utils';

interface BestsellerCardProps {
  name: string;
  description: string;
  price_m: number;
  price_l: number;
  image_url: string;
  badge?: string;
  is_available: boolean;
}

export function BestsellerCard({
  name,
  description,
  price_m,
  price_l,
  image_url,
  badge,
  is_available,
}: BestsellerCardProps) {
  const { t } = useTranslation('common');
  const [selectedSize, setSelectedSize] = useState<'M' | 'L'>('M');
  const price = selectedSize === 'M' ? price_m : price_l;
  const hasLarge = price_l > 0;

  return (
    <div className="group bg-background-50 rounded-lg border border-background-200/70 overflow-hidden transition-all duration-300 hover:border-primary-200">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!is_available && (
          <div className="absolute inset-0 bg-foreground-950/50 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-background-50 text-foreground-700 text-sm font-medium rounded-md">
              {t('comingSoon')}
            </span>
          </div>
        )}
        {badge && is_available && (
          <div className="absolute top-3 left-3">
            <Badge
              variant={badge === 'Best Seller' ? 'accent' : badge === "Chef's Pick" ? 'primary' : 'secondary'}
              size="sm"
            >
              {badge}
            </Badge>
          </div>
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-foreground-950/0 group-hover:bg-foreground-950/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-4 py-2 bg-background-50 text-foreground-950 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap">
            {t('quickView')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-foreground-950 font-heading leading-tight">
            {name}
          </h3>
          <p className="text-xs text-foreground-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Size Selector */}
        {hasLarge && (
          <div className="flex gap-1 p-0.5 bg-background-100 rounded-md">
            {(['M', 'L'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-sm transition-all duration-200 cursor-pointer whitespace-nowrap',
                  selectedSize === size
                    ? 'bg-primary-500 text-background-50'
                    : 'text-foreground-600 hover:text-foreground-900'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1 border-t border-background-200/60">
          <div>
            <span className="text-lg font-bold text-foreground-950 font-heading">
              {price} EGP
            </span>
            {hasLarge && (
              <span className="text-xs text-foreground-400 ml-1">
                / {selectedSize}
              </span>
            )}
          </div>
          <button
            disabled={!is_available}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer',
              is_available
                ? 'bg-primary-500 text-background-50 hover:bg-primary-600 active:scale-95'
                : 'bg-background-200 text-foreground-400 cursor-not-allowed'
            )}
            aria-label={t('addToCartAriaLabel', { name })}
          >
            <i className="ri-add-line text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}