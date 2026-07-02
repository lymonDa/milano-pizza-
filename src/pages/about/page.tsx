import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: 'ri-shield-check-line',
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-700',
      title: t('qualityFirst'),
      desc: t('qualityFirstDesc'),
    },
    {
      icon: 'ri-fire-line',
      bgLight: 'bg-accent-50',
      textColor: 'text-accent-700',
      title: t('woodFiredTradition'),
      desc: t('woodFiredTraditionDesc'),
    },
    {
      icon: 'ri-hand-heart-line',
      bgLight: 'bg-secondary-50',
      textColor: 'text-secondary-700',
      title: t('handmadeDaily'),
      desc: t('handmadeDailyDesc'),
    },
    {
      icon: 'ri-customer-service-2-line',
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-700',
      title: t('yourExperience'),
      desc: t('yourExperienceDesc'),
    },
  ];

  const stats = [
    { value: '15+', label: t('yearsOfTradition'), icon: 'ri-restaurant-2-line' },
    { value: '50+', label: t('pizzaVarieties'), icon: 'ri-cake-2-line' },
    { value: '12k+', label: t('happyCustomers'), icon: 'ri-heart-line' },
    { value: '30min', label: t('averageDelivery'), icon: 'ri-motorbike-line' },
  ];

  const promises = [
    {
      title: t('promiseDoughTitle'),
      desc: t('promiseDoughDesc'),
      icon: 'ri-time-line',
    },
    {
      title: t('promiseIngredientsTitle'),
      desc: t('promiseIngredientsDesc'),
      icon: 'ri-plant-line',
    },
    {
      title: t('promiseMadeToOrderTitle'),
      desc: t('promiseMadeToOrderDesc'),
      icon: 'ri-restaurant-line',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[320px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20rustic%20Italian%20pizzeria%20kitchen%20interior%20with%20wood%20fired%20brick%20oven%20glowing%20embers%20flour%20dusted%20wooden%20countertop%20fresh%20pizza%20dough%20balls%20in%20baskets%20hanging%20copper%20pots%20dried%20herbs%20bundles%20soft%20natural%20window%20light%20authentic%20traditional%20atmosphere%20editorial%20lifestyle%20photography%20rich%20warm%20tones&width=1600&height=900&seq=about-hero-milano-2026&orientation=landscape"
          alt={t('heroImageAlt')}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/55 via-foreground-950/30 to-foreground-950/60" />
        <div className="relative z-10 w-full text-center px-4 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-accent-400 uppercase tracking-widest mb-3">
            {t('ourStory')}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-background-50 font-heading mb-4">
            {t('aboutMilanoPizza')}
          </h1>
          <p className="text-sm md:text-base text-background-100/80 max-w-lg mx-auto leading-relaxed">
            {t('aboutHeroDesc')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2 block">
                {t('howItAllBegan')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading mb-5">
                {t('fromNaplesToEgypt')}
              </h2>
              <div className="space-y-4 text-sm md:text-base text-foreground-600 leading-relaxed">
                <p>{t('aboutStory1')}</p>
                <p>{t('aboutStory2')}</p>
                <p>{t('aboutStory3')}</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=Close%20up%20of%20Italian%20chef%20hands%20expertly%20stretching%20fresh%20pizza%20dough%20on%20floured%20wooden%20peel%20rustic%20kitchen%20background%20with%20wood%20fired%20oven%20flames%20visible%20soft%20warm%20lighting%20flour%20particles%20floating%20in%20air%20authentic%20craftsmanship%20moment%20editorial%20documentary%20style%20rich%20textures&width=800&height=600&seq=about-story-milano-2026&orientation=landscape"
                  alt={t('aboutStoryImageAlt')}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
                <div className="absolute -bottom-3 -left-3 w-24 h-24 rounded-lg bg-accent-500/10 hidden md:block" />
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-lg bg-primary-500/10 hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-secondary-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs font-semibold text-secondary-600 uppercase tracking-widest mb-2 block">
              {t('whatWeStandFor')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
              {t('theMilanoWay')}
            </h2>
            <p className="text-sm text-foreground-500 mt-2 max-w-lg mx-auto">
              {t('milanoWayDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="group bg-background-50 rounded-lg border border-background-200/70 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${value.bgLight} flex items-center justify-center`}>
                  <i className={`${value.icon} text-xl ${value.textColor}`} />
                </div>
                <h3 className="text-base font-bold text-foreground-900 mb-2 font-heading">
                  {value.title}
                </h3>
                <p className="text-sm text-foreground-500 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-primary-500">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-background-50/20 flex items-center justify-center">
                  <i className={`${stat.icon} text-lg text-background-50`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-background-50/80 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Promise */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-accent-600 uppercase tracking-widest mb-2 block">
              {t('ourPromise')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading mb-3">
              {t('freshEveryDay')}
            </h2>
            <p className="text-sm text-foreground-500 max-w-lg mx-auto">
              {t('freshEveryDayDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {promises.map((item) => (
              <div key={item.title} className="bg-background-100 rounded-lg border border-background-200/70 p-5 md:p-6">
                <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center mb-4">
                  <i className={`${item.icon} text-lg text-accent-600`} />
                </div>
                <h3 className="text-sm font-bold text-foreground-900 mb-2 font-heading">{item.title}</h3>
                <p className="text-xs md:text-sm text-foreground-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-18 px-4 md:px-6 lg:px-8 bg-foreground-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-3">
            {t('tasteTheDifference')}
          </h2>
          <p className="text-sm md:text-base text-foreground-300 max-w-lg mx-auto mb-7 leading-relaxed">
            {t('tasteTheDifferenceDesc')}
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
              <i className="ri-mail-line text-lg w-5 h-5 flex items-center justify-center" />
              {t('getInTouch')}
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
            '@type': 'AboutPage',
            '@id': `${import.meta.env.VITE_SITE_URL}/about#page`,
            name: 'About Milano Pizza — Italian Tradition in Hurghada',
            description: 'Milano Pizza has been serving authentic wood-fired Italian pizza in Hurghada for over 15 years. Learn about our story, values, and commitment to quality.',
            url: `${import.meta.env.VITE_SITE_URL}/about`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${import.meta.env.VITE_SITE_URL}/#website`,
              name: 'Milano Pizza',
              url: import.meta.env.VITE_SITE_URL,
            },
            about: {
              '@type': 'Restaurant',
              name: 'Milano Pizza',
              description: 'Authentic wood-fired Italian pizza in Hurghada, Egypt. Fresh dough, premium ingredients, 15+ years of tradition.',
              servesCuisine: 'Italian',
              image: 'https://readdy.ai/api/search-image?query=Warm%20rustic%20Italian%20pizzeria%20kitchen%20interior%20with%20wood%20fired%20brick%20oven%20glowing%20embers%20flour%20dusted%20wooden%20countertop%20fresh%20pizza%20dough%20balls%20in%20baskets%20hanging%20copper%20pots%20dried%20herbs%20bundles%20soft%20natural%20window%20light%20authentic%20traditional%20atmosphere&width=1200&height=630&orientation=landscape&seq=schema-about-2026',
              url: import.meta.env.VITE_SITE_URL,
            },
          }),
        }}
      />
    </div>
  );
}