import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/base/Skeleton';

interface Offer {
  id: string;
  title_ar: string;
  title_en: string;
  discount_type: string;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  linked_items: { id: string; name: string }[];
}

const colorSchemes = [
  { accent: 'bg-accent-500', bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-700', icon: 'ri-gift-2-line' },
  { accent: 'bg-primary-500', bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', icon: 'ri-percent-line' },
  { accent: 'bg-secondary-500', bg: 'bg-secondary-50', border: 'border-secondary-300', text: 'text-secondary-700', icon: 'ri-group-line' },
  { accent: 'bg-accent-500', bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-700', icon: 'ri-coupon-2-line' },
  { accent: 'bg-primary-500', bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', icon: 'ri-vip-crown-line' },
];

export default function Offers() {
  const { t } = useTranslation('common');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const now = new Date().toISOString();

      const { data: offData, error: offErr } = await supabase
        .from('offers')
        .select('*')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('ends_at', { ascending: true });

      if (offErr) throw new Error(offErr.message);

      if (!offData || offData.length === 0) {
        setOffers([]);
        return;
      }

      const offerIds = offData.map((o: Record<string, unknown>) => o.id as string);

      const { data: oiData, error: oiErr } = await supabase
        .from('offer_items')
        .select('offer_id, menu_item_id')
        .in('offer_id', offerIds);

      if (oiErr) throw new Error(oiErr.message);

      const menuItemIds = [...new Set((oiData || []).map((oi: Record<string, unknown>) => oi.menu_item_id as string))];

      let menuItemsMap: Record<string, string> = {};
      if (menuItemIds.length > 0) {
        const { data: menuData, error: menuErr } = await supabase
          .from('menu_items')
          .select('id, name')
          .in('id', menuItemIds);

        if (menuErr) throw new Error(menuErr.message);

        (menuData || []).forEach((m: Record<string, unknown>) => {
          menuItemsMap[m.id as string] = m.name as string;
        });
      }

      const linkedMap: Record<string, { id: string; name: string }[]> = {};
      (oiData || []).forEach((oi: Record<string, unknown>) => {
        const oid = oi.offer_id as string;
        const mid = oi.menu_item_id as string;
        if (!linkedMap[oid]) linkedMap[oid] = [];
        linkedMap[oid].push({ id: mid, name: menuItemsMap[mid] || mid });
      });

      setOffers(offData.map((o: Record<string, unknown>) => ({
        id: o.id as string,
        title_ar: o.title_ar as string || '',
        title_en: o.title_en as string || '',
        discount_type: o.discount_type as string,
        discount_value: o.discount_value as number,
        starts_at: o.starts_at as string,
        ends_at: o.ends_at as string,
        linked_items: linkedMap[o.id as string] || [],
      })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const formatDiscount = (offer: Offer) => {
    if (offer.discount_type === 'percentage') return t('percentOff', { value: offer.discount_value });
    return t('egpOff', { value: offer.discount_value });
  };

  const daysLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return t('endsToday');
    return t('daysLeft', { count: days });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[300px] md:h-[380px] flex items-center justify-center overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20rustic%20Italian%20pizzeria%20interior%20with%20wood%20fired%20oven%20glowing%20in%20background%20fresh%20ingredients%20scattered%20on%20marble%20countertop%20tomatoes%20basil%20mozzarella%20olive%20oil%20bottles%20soft%20golden%20pendant%20lighting%20cozy%20atmosphere%20shallow%20depth%20of%20field%20editorial%20food%20photography%20style%20rich%20warm%20tones%20inviting%20ambiance&width=1600&height=900&seq=offers-hero-milano-2026&orientation=landscape"
          alt={t('exclusiveDeals')}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/50 via-foreground-950/30 to-foreground-950/55" />
        <div className="relative z-10 w-full text-center px-4 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-accent-400 uppercase tracking-widest mb-3">
            {t('limitedTime')}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-background-50 font-heading mb-3">
            {t('exclusiveDeals')}
          </h1>
          <p className="text-sm md:text-base text-background-100/80 max-w-lg mx-auto leading-relaxed">
            {t('offersHeroDesc')}
          </p>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-background-200/70 p-5 md:p-6 space-y-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <Skeleton className="w-3/4" height="1.25rem" />
                  <Skeleton className="w-full" height="3rem" />
                  <div className="flex gap-3 pt-3 border-t border-background-200/60">
                    <Skeleton className="w-20" height="1.75rem" />
                    <Skeleton className="w-24" height="1rem" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-background-100 flex items-center justify-center mb-4">
                <i className="ri-error-warning-line text-2xl text-foreground-400" />
              </div>
              <p className="text-sm text-foreground-600 mb-4">{error}</p>
              <button
                onClick={fetchOffers}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-secondary-500 text-background-50 rounded-md text-sm font-medium hover:bg-secondary-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line text-base w-4 h-4 flex items-center justify-center" />
                {t('tryAgain')}
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-background-100 flex items-center justify-center mb-4">
                <i className="ri-coupon-line text-2xl text-foreground-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground-800 mb-2">{t('noActiveOffers')}</h3>
              <p className="text-sm text-foreground-500 max-w-md mb-6">{t('noActiveOffersDesc')}</p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-background-50 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                <i className="ri-restaurant-line text-base w-4 h-4 flex items-center justify-center" />
                {t('browseMenu')}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <span className="text-xs font-semibold text-accent-600 uppercase tracking-widest mb-2 block">
                  {t('activeOfferCount', { count: offers.length })}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
                  {t('dontMissOut')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {offers.map((offer, idx) => {
                  const scheme = colorSchemes[idx % colorSchemes.length];
                  return (
                    <div
                      key={offer.id}
                      className={`group relative overflow-hidden rounded-lg border ${scheme.border} ${scheme.bg} p-5 md:p-6 transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${scheme.accent} opacity-10 group-hover:scale-125 transition-transform duration-500`} />

                      <div className="relative z-10">
                        <div className={`w-11 h-11 rounded-full ${scheme.accent} flex items-center justify-center mb-4`}>
                          <i className={`${scheme.icon} text-lg text-background-50`} />
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`text-base md:text-lg font-bold ${scheme.text} font-heading leading-snug`}>
                            {offer.title_en}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-500 text-background-50 whitespace-nowrap shrink-0">
                            {daysLeft(offer.ends_at)}
                          </span>
                        </div>

                        {offer.title_ar && (
                          <p className="text-xs text-foreground-400 mb-2">{offer.title_ar}</p>
                        )}

                        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-bold ${scheme.accent} text-background-50 mb-3`}>
                          {formatDiscount(offer)}
                        </div>

                        {offer.linked_items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {offer.linked_items.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-background-50 text-foreground-600 border border-background-200/70 whitespace-nowrap"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-background-200/60">
                          <Link
                            to="/menu"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
                          >
                            {t('orderNowLabel')}
                            <i className="ri-arrow-right-line w-3 h-3 flex items-center justify-center" />
                          </Link>
                          <span className="text-[11px] text-foreground-400 whitespace-nowrap">
                            {t('until')} {new Date(offer.ends_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-foreground-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-3">
            {t('readyToTreatYourself')}
          </h2>
          <p className="text-sm md:text-base text-foreground-300 max-w-lg mx-auto mb-7 leading-relaxed">
            {t('readyToTreatYourselfDesc')}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-500 text-background-50 rounded-md font-semibold text-sm hover:bg-accent-600 transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
          >
            <i className="ri-restaurant-line text-lg w-5 h-5 flex items-center justify-center" />
            {t('browseFullMenu')}
          </Link>
        </div>
      </section>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${import.meta.env.VITE_SITE_URL}/offers#page`,
            name: 'Exclusive Deals & Offers — Milano Pizza Hurghada',
            description: 'Limited-time pizza deals and special offers at Milano Pizza. Enjoy discounts on your favorite Italian pizzas in Hurghada. Order online now.',
            url: `${import.meta.env.VITE_SITE_URL}/offers`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${import.meta.env.VITE_SITE_URL}/#website`,
              name: 'Milano Pizza',
              url: import.meta.env.VITE_SITE_URL,
            },
          }),
        }}
      />
    </div>
  );
}