import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ar',
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    debug: false,
    resources: messages,
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng: string) => {
  const html = document.documentElement;
  html.lang = lng;
  html.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

// Set initial direction
const html = document.documentElement;
html.lang = i18n.language || 'ar';
html.dir = (i18n.language || 'ar') === 'ar' ? 'rtl' : 'ltr';

export default i18n;