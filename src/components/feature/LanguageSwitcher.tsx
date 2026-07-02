import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'it', label: 'Italiano', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
] as const;

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');
  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={cn(
              'px-2 py-1 text-sm rounded-md transition-colors cursor-pointer whitespace-nowrap',
              current.code === lang.code
                ? 'bg-primary-500 text-background-50'
                : 'text-foreground-600 hover:bg-background-100'
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative group', className)}>
      <button data-trigger="true" className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground-700 hover:bg-background-100 rounded-md transition-colors cursor-pointer">
        <i className="ri-global-line" />
        <span className="hidden sm:inline">{current.label}</span>
        <i className="ri-arrow-down-s-line text-xs" />
      </button>
      <div className="absolute top-full ltr:right-0 rtl:left-0 mt-1 py-1 bg-background-50 border border-background-200/70 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[140px] z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={cn(
              'w-full ltr:text-left rtl:text-right px-4 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap',
              current.code === lang.code
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-foreground-700 hover:bg-background-100'
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}