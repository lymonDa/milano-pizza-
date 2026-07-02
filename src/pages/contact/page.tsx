import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export default function Contact() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const honeypot = (form.elements.namedItem('phone_alt') as HTMLInputElement)?.value?.trim();
    if (honeypot) {
      setStatus('success');
      form.reset();
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setSubmitting(true);
    setStatus('idle');

    try {
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
      const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();

      // Insert to Supabase first
      const { data: inserted, error: supaError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          phone: phone || null,
          message,
          is_read: false,
        })
        .select('id')
        .single();

      // eslint-disable-next-line no-console
      console.log('Supabase insert result:', supaError ? `FAILED: ${supaError.message} (code: ${supaError.code})` : `SUCCESS - id: ${inserted?.id}`);

      if (supaError) {
        // eslint-disable-next-line no-console
        console.error('Supabase error details:', JSON.stringify(supaError));
        throw new Error(`Database error: ${supaError.message} (${supaError.code})`);
      }

      // Then submit to Readdy form (non-critical)
      try {
        const formBody = new URLSearchParams();
        formBody.append('name', name);
        formBody.append('email', email);
        if (phone) formBody.append('phone', phone);
        formBody.append('message', message);

        const res = await fetch('https://readdy.ai/api/form/d92ld7dpggnemm8f9vc0', {
          method: 'POST',
          body: formBody,
        });
        // eslint-disable-next-line no-console
        console.log('Readdy form response:', res.status, res.statusText);
      } catch (fetchErr: unknown) {
        // eslint-disable-next-line no-console
        console.warn('Readdy form failed (non-critical):', fetchErr);
      }

      setStatus('success');
      form.reset();
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Contact form submit failed:', err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: 'ri-facebook-circle-fill', label: t('facebook'), href: '#' },
    { icon: 'ri-instagram-line', label: t('instagram'), href: '#' },
    { icon: 'ri-whatsapp-line', label: t('whatsapp'), href: '#' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[280px] md:h-[360px] flex items-center justify-center overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20inviting%20Italian%20restaurant%20storefront%20at%20golden%20hour%20with%20string%20lights%20outdoor%20seating%20area%20terracotta%20planters%20with%20herbs%20handwritten%20chalkboard%20menu%20rustic%20wooden%20door%20slightly%20ajar%20cozy%20neighborhood%20trattoria%20vibe%20soft%20evening%20light%20casting%20long%20shadows%20welcoming%20atmosphere%20editorial%20photography&width=1600&height=900&seq=contact-hero-milano-2026&orientation=landscape"
          alt={t('contactImageAlt')}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/55 via-foreground-950/30 to-foreground-950/60" />
        <div className="relative z-10 w-full text-center px-4 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-accent-400 uppercase tracking-widest mb-3">
            {t('contactHeroLabel')}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-background-50 font-heading mb-4">
            {t('contactUs')}
          </h1>
          <p className="text-sm md:text-base text-background-100/80 max-w-lg mx-auto leading-relaxed">
            {t('contactHeroDesc')}
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <h2 className="text-xl md:text-2xl font-bold text-foreground-950 font-heading mb-2">
                {t('sendUsMessage')}
              </h2>
              <p className="text-sm text-foreground-500 mb-6">
                {t('contactFormDesc')}
              </p>

              {status === 'success' ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                    <i className="ri-check-line text-2xl text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground-900 mb-1">{t('messageSent')}</h3>
                  <p className="text-sm text-foreground-500">{t('messageSentDesc')}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  data-readdy-form
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-foreground-800 mb-1.5">
                        {t('yourNameLabel')} <span className="text-accent-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder={t('namePlaceholder')}
                        className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-foreground-800 mb-1.5">
                        {t('emailAddressLabel')} <span className="text-accent-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground-800 mb-1.5">
                      {t('phoneNumberLabel')}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                    />
                  </div>

                  {/* Honeypot — hidden from users */}
                  <div className="absolute opacity-0 pointer-events-none" style={{ height: 0, overflow: 'hidden' }}>
                    <input
                      type="text"
                      name="phone_alt"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-foreground-800 mb-1.5">
                      {t('yourMessageLabel')} <span className="text-accent-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      maxLength={500}
                      placeholder={t('messagePlaceholder')}
                      className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none"
                    />
                    <p className="text-xs text-foreground-400 mt-1">{t('maxCharsLabel')}</p>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-accent-50 text-accent-700 text-sm">
                      <i className="ri-error-warning-line text-base w-4 h-4 flex items-center justify-center" />
                      {t('contactErrorMsg')}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 text-background-50 rounded-md font-semibold text-sm hover:bg-primary-600 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin" />
                        {t('sendingText')}
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line text-base w-4 h-4 flex items-center justify-center" />
                        {t('sendMessageBtn')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-2 space-y-5">
              {/* Phone */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                  <i className="ri-phone-line text-lg text-primary-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground-900 mb-1 font-heading">{t('callUs')}</h3>
                <p className="text-sm text-foreground-600 mb-3">{t('availableHours')}</p>
                <a
                  href="tel:+201033561945"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-phone-fill text-base w-4 h-4 flex items-center justify-center" />
                  0103 3561945
                </a>
              </div>

              {/* Address */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center mb-3">
                  <i className="ri-map-pin-line text-lg text-accent-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground-900 mb-1 font-heading">{t('visitUs')}</h3>
                <p className="text-sm text-foreground-600 whitespace-pre-line">
                  {t('visitAddress')}
                </p>
              </div>

              {/* Hours */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center mb-3">
                  <i className="ri-time-line text-lg text-secondary-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground-900 mb-1 font-heading">{t('openingHours')}</h3>
                <div className="space-y-1.5 text-sm text-foreground-600">
                  <div className="flex items-center justify-between">
                    <span>{t('sundayToThursday')}</span>
                    <span className="font-medium text-foreground-800">{t('hoursWeekday')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('fridayToSaturday')}</span>
                    <span className="font-medium text-foreground-800">{t('hoursWeekend')}</span>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-background-100 border border-background-200/70 rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                  <i className="ri-share-line text-lg text-primary-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground-900 mb-3 font-heading">{t('followUs')}</h3>
                <div className="flex items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-background-50 text-foreground-500 hover:bg-primary-500 hover:text-background-50 transition-colors"
                      rel="nofollow"
                    >
                      <i className={`${s.icon} text-lg`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="w-full h-[350px] md:h-[420px]">
        <iframe
          title={t('mapTitle')}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.123456789!2d31.2357!3d29.9608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDU3JzM5LjAiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1680000000000"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8 bg-foreground-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background-50 font-heading mb-3">
            {t('readyToOrderQ')}
          </h2>
          <p className="text-sm md:text-base text-foreground-300 max-w-lg mx-auto mb-7 leading-relaxed">
            {t('readyToOrderDesc')}
          </p>
          <a
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-500 text-background-50 rounded-md font-semibold text-sm hover:bg-accent-600 transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
          >
            <i className="ri-restaurant-line text-lg w-5 h-5 flex items-center justify-center" />
            {t('browseMenu')}
          </a>
        </div>
      </section>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            '@id': `${import.meta.env.VITE_SITE_URL}/contact#page`,
            name: 'Contact Milano Pizza — Get in Touch | Hurghada',
            description: 'Contact Milano Pizza in Hurghada for orders, inquiries, and reservations. Two branches: Arabia and Dahar. Call us or send a message online.',
            url: `${import.meta.env.VITE_SITE_URL}/contact`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${import.meta.env.VITE_SITE_URL}/#website`,
              name: 'Milano Pizza',
              url: import.meta.env.VITE_SITE_URL,
            },
            mainEntity: {
              '@type': 'Restaurant',
              name: 'Milano Pizza',
              telephone: '+201033561945',
              email: 'info@milanopizza.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Arabia, in front of Al Salam Hospital',
                addressLocality: 'Hurghada',
                addressRegion: 'Red Sea Governorate',
                addressCountry: 'EG',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+201033561945',
                contactType: 'customer service',
                availableLanguage: ['Arabic', 'English'],
              },
            },
          }),
        }}
      />
    </div>
  );
}