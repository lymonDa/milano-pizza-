import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BestsellerCard } from './components/BestsellerCard';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { supabase } from '@/lib/supabase';

const offerColorSchemes = [
  { accent: 'bg-accent-500', bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-700', icon: 'ri-gift-2-line' },
  { accent: 'bg-primary-500', bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', icon: 'ri-percent-line' },
  { accent: 'bg-secondary-500', bg: 'bg-secondary-50', border: 'border-secondary-300', text: 'text-secondary-700', icon: 'ri-group-line' },
];

const dateLocaleMap: Record<string, string> = {
  ar: 'ar-EG',
  de: 'de-DE',
  it: 'it-IT',
  ru: 'ru-RU',
  en: 'en-GB',
};

interface ActiveOffer {
  id: string;
  title_ar: string;
  title_en: string;
  discount_type: string;
  discount_value: number;
  ends_at: string;
}

interface BestsellerItem {
  id: string;
  name_en: string;
  description_en: string;
  base_price_m: number;
  base_price_l: number;
  price_m_arabia: number | null;
  price_l_arabia: number | null;
  price_m_dahar: number | null;
  price_l_dahar: number | null;
  image_url: string;
  is_available: boolean;
}

function getBranchPrice(item: BestsellerItem, size: 'M' | 'L', branch: Branch): number {
  if (branch === 'arabia') {
    const price = size === 'M' ? item.price_m_arabia : item.price_l_arabia;
    if (price != null) return Number(price);
  }
  if (branch === 'dahar') {
    const price = size === 'M' ? item.price_m_dahar : item.price_l_dahar;
    if (price != null) return Number(price);
  }
  return size === 'M' ? Number(item.base_price_m) : Number(item.base_price_l);
}

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const { branch } = useBranch();
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [bestsellers, setBestsellers] = useState<BestsellerItem[]>([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('ends_at', { ascending: true })
        .limit(3);

      if (error) throw error;
      setActiveOffers((data || []) as ActiveOffer[]);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchBestsellers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name_en, description_en, base_price_m, base_price_l, price_m_arabia, price_l_arabia, price_m_dahar, price_l_dahar, image_url, is_available')
        .eq('is_available', true)
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBestsellers((data || []) as BestsellerItem[]);
    } catch {
      // Silently fail
    } finally {
      setBestsellersLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); fetchBestsellers(); }, [fetchOffers, fetchBestsellers]);

  const stats = [
    { value: '15+', labelKey: 'yearsOfTradition', icon: 'ri-restaurant-2-line' },
    { value: '50+', labelKey: 'pizzaVarieties', icon: 'ri-cake-2-line' },
    { value: '12k+', labelKey: 'happyCustomers', icon: 'ri-heart-line' },
    { value: '30min', labelKey: 'averageDelivery', icon: 'ri-motorbike-line' },
  ];

  const dateLocale = dateLocaleMap[i18n.language] || 'en-GB';

  return (
    <div className="min-h-screen">
      {/* ===== Hero ===== */}
      <section className="relative h-[520px] md:h-[640px] flex items-center justify-center overflow-hidden">
        <img
          src="https://storage.readdy-site.link/project_files/2f864ff7-e4d2-4720-904f-aaee88750e38/7cfe21ec-bf8f-4b3b-a0d4-2d1847789d70_compressed_WhatsApp-Image-2026-07-02-at-19.33.32.webp?__preview_ts=2026-07-02T16%3A40%3A27.420692Z"
          alt={t('heroImageAlt')}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/70" />
        <div className="relative z-10 w-full text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-xs text-white font-medium">
              {t('nowDeliveringAllAcross')}
            </span>
          </div>
          <div className="inline-block rounded-3xl bg-black/70 px-6 py-5">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-[0_25px_30px_rgba(0,0,0,0.55)] font-heading leading-tight mb-4">
              {t('tasteThe')} <span className="text-amber-300">{t('tradition')}</span>
            </h1>
            <p className="text-sm md:text-lg text-white/95 drop-shadow-[0_18px_25px_rgba(0,0,0,0.45)] max-w-xl mx-auto mb-8 leading-relaxed">
              {t('heroDesc')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent-500 text-white rounded-md font-semibold text-sm hover:bg-accent-600 transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
            >
              <i className="ri-restaurant-line text-lg w-5 h-5 flex items-center justify-center" />
              {t('orderNow')}
            </Link>
            <Link
              to="/offers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-background-50/10 text-background-50 backdrop-blur-sm border border-background-50/25 rounded-md font-medium text-sm hover:bg-background-50/20 transition-all duration-200 whitespace-nowrap"
            >
              <i className="ri-percent-line text-lg w-5 h-5 flex items-center justify-center" />
              {t('viewOffers')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-xs text-background-50/60 font-medium tracking-wide uppercase">
            {t('scroll')}
          </span>
          <span className="w-5 h-8 rounded-full border-2 border-background-50/30 flex items-start justify-center p-1">
            <span className="w-1.5 h-1.5 rounded-full bg-background-50/60 animate-bounce" />
          </span>
        </div>
      </section>

      {/* ===== Best Sellers ===== */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2 block">
                {t('mostLoved')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
                {t('ourBestSellers')}
              </h2>
              <p className="text-sm text-foreground-500 mt-2 max-w-md">
                {t('bestSellersDesc')}
              </p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mt-4 sm:mt-0 whitespace-nowrap"
            >
              {t('exploreFullMenu')}
              <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {bestsellersLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bestsellers.length > 0 ? (
              bestsellers.map((pizza) => {
                const priceM = getBranchPrice(pizza, 'M', branch);
                const priceL = getBranchPrice(pizza, 'L', branch);
                return (
                  <BestsellerCard
                    key={pizza.id}
                    name={pizza.name_en}
                    description={pizza.description_en || ''}
                    price_m={priceM}
                    price_l={priceL}
                    image_url={pizza.image_url}
                    badge={undefined}
                    is_available={pizza.is_available}
                  />
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-background-100 flex items-center justify-center mb-3">
                  <i className="ri-restaurant-line text-xl text-foreground-400" />
                </div>
                <p className="text-sm text-foreground-500">{t('bestSellersComingSoon')}</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
            >
              {t('exploreFullMenu')}
              <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="py-10 md:py-14 px-4 md:px-6 lg:px-8 bg-primary-500">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-background-50/20 flex items-center justify-center">
                  <i className={`${stat.icon} text-lg text-background-50`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-background-50/80 font-medium">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Active Offers ===== */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-secondary-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-accent-600 uppercase tracking-widest mb-2 block">
              {t('limitedTime')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
              {t('hotDealsAndOffers')}
            </h2>
            <p className="text-sm text-foreground-500 mt-2 max-w-md mx-auto">
              {t('offersHomeDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {activeOffers.length > 0 ? activeOffers.map((offer, idx) => {
              const scheme = offerColorSchemes[idx % offerColorSchemes.length];
              const discountLabel = offer.discount_type === 'percentage'
                ? t('percentOff', { value: offer.discount_value })
                : t('egpOff', { value: offer.discount_value });
              return (
                <div
                  key={offer.id}
                  className={`group relative overflow-hidden rounded-lg border ${scheme.border} ${scheme.bg} p-5 md:p-6 transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Decorative icon blob */}
                  <div className={`absolute -top-3 -right-3 w-20 h-20 rounded-full ${scheme.accent} opacity-10 group-hover:scale-125 transition-transform duration-500`} />

                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-full ${scheme.accent} flex items-center justify-center mb-4`}>
                      <i className={`${scheme.icon} text-lg text-background-50`} />
                    </div>

                    <h3 className={`text-base md:text-lg font-bold ${scheme.text} font-heading leading-snug mb-2`}>
                      {offer.title_en}
                    </h3>
                    {offer.title_ar && (
                      <p className="text-xs text-foreground-400 mb-3">{offer.title_ar}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-background-200/60">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${scheme.accent} text-background-50`}>
                        {discountLabel}
                      </span>
                      <span className="text-xs text-foreground-400">
                        {t('until')} {new Date(offer.ends_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-background-100 flex items-center justify-center mb-3">
                  <i className="ri-coupon-line text-xl text-foreground-400" />
                </div>
                <p className="text-sm text-foreground-500">{t('noActiveOffersNow')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== About Teaser ===== */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
            <div className="order-2 md:order-1">
              <span className="text-xs font-semibold text-secondary-600 uppercase tracking-widest mb-2 block">
                {t('ourStory')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading mb-5">
                {t('aboutMilanoPizza')}
              </h2>
              <div className="space-y-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                <p>
                  {t('aboutTeaser1')}
                </p>
                <p>
                  {t('aboutTeaser2')}
                </p>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                {t('readOurFullStory')}
                <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=Italian%20chef%20hands%20stretching%20fresh%20pizza%20dough%20on%20floured%20wooden%20countertop%20warm%20rustic%20pizzeria%20kitchen%20with%20wood%20fired%20oven%20in%20background%20fresh%20ingredients%20tomatoes%20basil%20mozzarella%20scattered%20around%20golden%20evening%20light%20streaming%20through%20window%20editorial%20documentary%20style%20photography%20authentic%20atmosphere%20warm%20tones&width=800&height=600&seq=about-milano-2026&orientation=landscape"
                  alt={t('ourPizzaioloAtWork')}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
                {/* Decorative element */}
                <div className="absolute -bottom-3 -left-3 w-24 h-24 rounded-lg bg-accent-500/10 hidden md:block" />
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-lg bg-primary-500/10 hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-foreground-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-3">
            {t('readyForRealItalian')}
          </h2>
          <p className="text-sm md:text-base text-foreground-300 max-w-lg mx-auto mb-7 leading-relaxed">
            {t('ctaBannerDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent-500 text-background-50 rounded-md font-semibold text-sm hover:bg-accent-600 transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
            >
              <i className="ri-restaurant-line text-lg w-5 h-5 flex items-center justify-center" />
              {t('browseMenu')}
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-background-50 border border-background-50/25 rounded-md font-medium text-sm hover:bg-background-50/10 transition-all duration-200 whitespace-nowrap"
            >
              <i className="ri-phone-line text-lg w-5 h-5 flex items-center justify-center" />
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </section>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            '@id': `${import.meta.env.VITE_SITE_URL}/#restaurant`,
            name: 'Milano Pizza',
            description: 'Authentic wood-fired Italian pizza in Hurghada, Egypt. Fresh dough, premium ingredients, two branches serving Arabia and Dahar areas.',
            image: 'https://readdy.ai/api/search-image?query=Authentic%20Italian%20Neapolitan%20pizza%20fresh%20out%20of%20wood%20fired%20oven%20with%20bubbly%20charred%20crust%20melted%20buffalo%20mozzarella%20fresh%20basil%20leaves%20San%20Marzano%20tomato%20sauce%20rustic%20wooden%20peel%20warm%20golden%20hour%20lighting&width=1200&height=630&orientation=landscape&seq=schema-home-2026',
            url: import.meta.env.VITE_SITE_URL,
            telephone: '+201033561945',
            email: 'info@milanopizza.com',
            servesCuisine: 'Italian',
            priceRange: '$$',
            currenciesAccepted: 'EGP',
            paymentAccepted: 'Cash, Vodafone Cash',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Arabia, in front of Al Salam Hospital',
              addressLocality: 'Hurghada',
              addressRegion: 'Red Sea Governorate',
              addressCountry: 'EG',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 27.2579,
              longitude: 33.8116,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                opens: '12:00',
                closes: '23:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Friday', 'Saturday'],
                opens: '12:00',
                closes: '00:00',
              },
            ],
            hasMenu: `${import.meta.env.VITE_SITE_URL}/menu`,
            sameAs: [
              'https://www.facebook.com/milanopizzahurghada',
              'https://www.instagram.com/milanopizzahurghada',
            ],
          }),
        }}
      />
    </div>
  );
}