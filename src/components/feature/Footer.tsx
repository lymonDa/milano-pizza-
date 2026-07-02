import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary-50 border-t border-secondary-100">
      <div className="w-full px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                <i className="ri-restaurant-2-line text-background-50" />
              </div>
              <span className="text-lg font-bold font-heading text-primary-700">
                {t('brand')}
              </span>
            </div>
            <p className="text-sm text-foreground-600 leading-relaxed max-w-xs">
              {t('footerTagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground-900 mb-3 uppercase tracking-wide">
              {t('menu')}
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/menu', label: 'menu' },
                { to: '/offers', label: 'offers' },
                { to: '/events', label: 'events' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-foreground-600 hover:text-primary-600 transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground-900 mb-3 uppercase tracking-wide">
              {t('aboutUs')}
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'about' },
                { to: '/contact', label: 'contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-foreground-600 hover:text-primary-600 transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground-900 mb-3 uppercase tracking-wide">
              {t('contactUs')}
            </h4>
            <ul className="space-y-2 text-sm text-foreground-600">
              <li className="flex items-center gap-2">
                <i className="ri-phone-line text-primary-500" />
                <span>0103 3561945</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-map-pin-line text-primary-500" />
                <span>Egypt</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-secondary-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-500">
            &copy; {year} {t('brand')}. {t('allRightsReserved')}.
          </p>
          {/* Developer Credit */}
          <div className="flex items-center gap-1.5 text-xs text-foreground-500">
            <span>{t('developedBy')}</span>
            <a
              href="https://github.com/lymonDa"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 text-foreground-700 hover:text-primary-600 transition-colors font-medium"
            >
              <i className="ri-github-fill" />
              LymonDa
            </a>
          </div>
          <div className="flex items-center gap-3">
            {[
              { icon: 'ri-facebook-circle-fill', label: 'Facebook' },
              { icon: 'ri-instagram-line', label: 'Instagram' },
              { icon: 'ri-whatsapp-line', label: 'WhatsApp' },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-background-100 text-foreground-500 hover:bg-primary-500 hover:text-background-50 transition-colors"
                rel="nofollow"
              >
                <i className={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}