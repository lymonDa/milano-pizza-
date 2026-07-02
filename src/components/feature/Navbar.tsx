import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useBranch } from '@/contexts/BranchContext';

const navLinks = [
  { to: '/', label: 'home', icon: 'ri-home-4-line' },
  { to: '/menu', label: 'menu', icon: 'ri-restaurant-2-line' },
  { to: '/offers', label: 'offers', icon: 'ri-coupon-2-line' },
  { to: '/events', label: 'events', icon: 'ri-calendar-event-line' },
  { to: '/about', label: 'about', icon: 'ri-information-line' },
  { to: '/contact', label: 'contact', icon: 'ri-mail-send-line' },
];

export function Navbar() {
  const { t } = useTranslation('common');
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { branch } = useBranch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close with animation
  const closeMobile = () => {
    setClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, 250);
  };

  useEffect(() => {
    closeMobile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) closeMobile();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  const isHome = location.pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled || !isHome
          ? 'bg-background-50/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <i className="ri-restaurant-2-line text-background-50 text-lg" />
            </div>
            <span
              className={cn(
                'text-lg md:text-xl font-bold font-heading tracking-tight',
                scrolled || !isHome ? 'text-primary-700' : 'text-background-50'
              )}
            >
              {t('MilanoPizza')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  location.pathname === link.to
                    ? scrolled || !isHome
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-background-50 bg-background-50/20'
                    : scrolled || !isHome
                      ? 'text-foreground-700 hover:text-primary-600 hover:bg-background-100'
                      : 'text-background-50/80 hover:text-background-50 hover:bg-background-50/10'
                )}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Branch Indicator - Desktop */}
            {user && branch && (
              <button
                onClick={() => navigate('/select-branch')}
                className={cn(
                  'hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap',
                  scrolled || !isHome
                    ? 'bg-background-100 border-background-200/70 text-foreground-600 hover:border-primary-300 hover:text-primary-600'
                    : 'bg-background-50/10 border-background-50/20 text-background-50 hover:bg-background-50/20'
                )}
                title={t('switchBranch')}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-map-pin-line text-sm" />
                </span>
                <span>{branch === 'arabia' ? t('branchArabia') : t('branchDahar')}</span>
                <span className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-xs" />
                </span>
              </button>
            )}

            <LanguageSwitcher
              variant="dropdown"
              className={cn(
                scrolled || !isHome ? '' : '[&_button[data-trigger]]:text-background-50 [&_button[data-trigger]:hover]:bg-background-50/10'
              )}
            />

            {/* Cart */}
            <Link
              to="/cart"
              className={cn(
                'relative w-9 h-9 flex items-center justify-center rounded-md transition-colors',
                scrolled || !isHome
                  ? 'text-foreground-700 hover:bg-background-100'
                  : 'text-background-50 hover:bg-background-50/10'
              )}
              aria-label={t('cart')}
            >
              <i className="ri-shopping-bag-3-line text-lg" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 ltr:-right-0.5 rtl:-left-0.5 w-4 h-4 bg-accent-500 text-background-50 text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / Login */}
            {user ? (
              <Link
                to="/account"
                className={cn(
                  'hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  scrolled || !isHome
                    ? 'text-foreground-700 hover:bg-background-100'
                    : 'text-background-50 hover:bg-background-50/10'
                )}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-user-line" />
                </span>
                {t('account')}
              </Link>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'hidden md:inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  scrolled || !isHome
                    ? 'bg-primary-500 text-background-50 hover:bg-primary-600'
                    : 'bg-background-50 text-primary-700 hover:bg-background-100'
                )}
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => mobileOpen ? closeMobile() : setMobileOpen(true)}
              className={cn(
                'md:hidden w-9 h-9 flex items-center justify-center rounded-md transition-colors cursor-pointer',
                scrolled || !isHome
                  ? 'text-foreground-700 hover:bg-background-100'
                  : 'text-background-50 hover:bg-background-50/10'
              )}
              aria-label="Menu"
            >
              <i className={cn(
                'text-xl transition-transform duration-300',
                mobileOpen && !closing ? 'ri-close-line rotate-90' : 'ri-menu-line rotate-0'
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {(mobileOpen || closing) && (
        <div
          className={cn(
            'fixed inset-0 top-16 md:hidden bg-foreground-950/40 backdrop-blur-sm z-30 transition-opacity duration-300',
            closing ? 'opacity-0' : 'opacity-100'
          )}
          onClick={closeMobile}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={cn(
          'md:hidden absolute top-16 left-0 right-0 bg-background-50 shadow-2xl overflow-hidden transition-all duration-300 ease-out z-30',
          mobileOpen && !closing
            ? 'max-h-[85vh] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="px-4 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'group flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-foreground-700 hover:bg-background-100 active:scale-[0.98]'
                  )}
                  style={{
                    animationDelay: `${idx * 40}ms`,
                    animation: mobileOpen && !closing ? 'slideInRight 0.35s ease-out both' : 'none',
                  }}
                >
                  <span className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200',
                    isActive
                      ? 'bg-primary-500 text-background-50'
                      : 'bg-background-100 text-foreground-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                  )}>
                    <i className={cn(link.icon, 'text-lg')} />
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'font-semibold' : ''
                  )}>
                    {t(link.label)}
                  </span>
                  {isActive && (
                    <span className="ms-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="flex items-center gap-3 px-4">
            <span className="h-px flex-1 bg-background-200/70" />
            <span className="text-[10px] font-semibold text-foreground-400 uppercase tracking-widest whitespace-nowrap">
              {t('quickActions')}
            </span>
            <span className="h-px flex-1 bg-background-200/70" />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            {/* Branch Switcher */}
            {user && branch && (
              <button
                onClick={() => { closeMobile(); navigate('/select-branch'); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-background-100 border border-background-200/70 text-foreground-700 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
                style={{
                  animationDelay: '300ms',
                  animation: mobileOpen && !closing ? 'slideInRight 0.35s ease-out both' : 'none',
                }}
              >
                <span className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <i className="ri-map-pin-line text-lg text-primary-600" />
                </span>
                <div className="text-start flex-1 min-w-0">
                  <span className="block text-xs text-foreground-400">{t('currentBranch')}</span>
                  <span className="block text-sm font-semibold text-foreground-900 truncate">
                    {branch === 'arabia' ? t('branchArabia') : t('branchDahar')}
                  </span>
                </div>
                <span className="w-6 h-6 flex items-center justify-center text-foreground-400 shrink-0">
                  <i className="ri-arrow-left-s-line rtl:rotate-180" />
                </span>
              </button>
            )}

            {/* Account / Login */}
            {user ? (
              <Link
                to="/account"
                onClick={closeMobile}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary-500 text-background-50 hover:bg-primary-600 transition-all duration-200 active:scale-[0.98] group"
                style={{
                  animationDelay: '340ms',
                  animation: mobileOpen && !closing ? 'slideInRight 0.35s ease-out both' : 'none',
                }}
              >
                <span className="w-10 h-10 rounded-lg bg-background-50/20 flex items-center justify-center shrink-0">
                  <i className="ri-user-line text-lg" />
                </span>
                <span className="text-sm font-semibold">{t('account')}</span>
                <span className="ms-auto w-6 h-6 flex items-center justify-center shrink-0">
                  <i className="ri-arrow-left-s-line rtl:rotate-180" />
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary-500 text-background-50 hover:bg-primary-600 transition-all duration-200 active:scale-[0.98] group"
                style={{
                  animationDelay: '340ms',
                  animation: mobileOpen && !closing ? 'slideInRight 0.35s ease-out both' : 'none',
                }}
              >
                <span className="w-10 h-10 rounded-lg bg-background-50/20 flex items-center justify-center shrink-0">
                  <i className="ri-login-box-line text-lg" />
                </span>
                <span className="text-sm font-semibold">{t('login')}</span>
                <span className="ms-auto w-6 h-6 flex items-center justify-center shrink-0">
                  <i className="ri-arrow-left-s-line rtl:rotate-180" />
                </span>
              </Link>
            )}
          </div>

          {/* Contact Info at Bottom */}
          <div className="pt-2 px-4 pb-1">
            <div className="flex items-center gap-3 text-xs text-foreground-400">
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className="ri-phone-line text-xs" />
              </span>
              <span dir="ltr">01033561945</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}