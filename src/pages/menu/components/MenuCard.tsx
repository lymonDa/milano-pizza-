import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MenuCardProps {
  name: string;
  description: string;
  price_m: number;
  price_l: number;
  image_url: string;
  is_available: boolean;
  onClick: () => void;
  onAdd: () => void;
}

export function MenuCard({
  name,
  description,
  price_m,
  price_l,
  image_url,
  is_available,
  onClick,
  onAdd,
}: MenuCardProps) {
  const { t } = useTranslation('common');
  const hasLarge = price_l > 0;

  return (
    <div
      className="group bg-background-50 rounded-lg border border-background-200/70 overflow-hidden transition-all duration-300 hover:border-primary-200 hover:shadow-sm cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
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
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-foreground-950 font-heading leading-tight">
            {name}
          </h3>
          <p className="text-xs text-foreground-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-background-200/60">
          <div>
            <span className="text-lg font-bold text-foreground-950 font-heading">
              {price_m} EGP
            </span>
            {hasLarge && (
              <span className="text-xs text-foreground-400 ml-1">
                {t('from')}
              </span>
            )}
          </div>
          <button
            disabled={!is_available}
            onClick={(e) => {
              e.stopPropagation();
              if (is_available) onAdd();
            }}
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