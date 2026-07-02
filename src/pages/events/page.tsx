import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/base/Skeleton';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  event_date: string;
}

export default function Events() {
  const { t } = useTranslation('common');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registerModal, setRegisterModal] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({ name: '', phone: '' });
  const [regStatus, setRegStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [regError, setRegError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (err) throw new Error(err.message);
      setEvents((data || []) as Event[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= now);
  const pastEvents = events.filter((e) => new Date(e.event_date) < now);

  const openRegister = (eventId: string) => {
    setRegisterModal(eventId);
    setRegForm({ name: '', phone: '' });
    setRegStatus('idle');
    setRegError('');
  };

  const handleRegister = async () => {
    if (!regForm.name.trim() || !regForm.phone.trim()) return;
    setRegStatus('submitting');
    setRegError('');
    try {
      const { data, error } = await supabase.functions.invoke('register-for-event', {
        body: {
          eventId: registerModal,
          name: regForm.name.trim(),
          phone: regForm.phone.trim(),
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Registration failed');

      setRegStatus('success');
      setTimeout(() => setRegisterModal(null), 2000);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : String(err));
      setRegStatus('error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[300px] md:h-[380px] flex items-center justify-center overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Warm%20atmospheric%20Italian%20restaurant%20interior%20with%20long%20communal%20table%20set%20for%20special%20dinner%20event%20candlelit%20ambiance%20wine%20glasses%20fresh%20flowers%20rustic%20wooden%20beams%20soft%20bokeh%20lights%20in%20background%20elegant%20yet%20cozy%20upscale%20dining%20experience%20golden%20hour%20tones%20editorial%20photography&width=1600&height=900&seq=events-hero-milano-2026&orientation=landscape"
          alt={t('eventsGatherings')}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/50 via-foreground-950/30 to-foreground-950/55" />
        <div className="relative z-10 w-full text-center px-4 max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-accent-400 uppercase tracking-widest mb-3">
            {t('joinExperience')}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-background-50 font-heading mb-3">
            {t('eventsGatherings')}
          </h1>
          <p className="text-sm md:text-base text-background-100/80 max-w-lg mx-auto leading-relaxed">
            {t('eventsHeroDesc')}
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 px-4 md:px-6 lg:px-8 bg-background-50">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-background-200/70 overflow-hidden">
                  <Skeleton className="w-full" height="12rem" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="w-1/3" height="1rem" />
                    <Skeleton className="w-2/3" height="1.25rem" />
                    <Skeleton className="w-full" height="2.5rem" />
                    <Skeleton className="w-28" height="2rem" />
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
                onClick={fetchEvents}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-secondary-500 text-background-50 rounded-md text-sm font-medium hover:bg-secondary-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line text-base w-4 h-4 flex items-center justify-center" />
                {t('tryAgain')}
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-background-100 flex items-center justify-center mb-4">
                <i className="ri-calendar-event-line text-2xl text-foreground-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground-800 mb-2">{t('noEventsScheduled')}</h3>
              <p className="text-sm text-foreground-500 max-w-md">{t('noEventsDesc')}</p>
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-10">
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2 block">
                      {t('upcomingCount', { count: upcomingEvents.length })}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground-950 font-heading">
                      {t('whatsComingUp')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        onRegister={() => openRegister(event.id)}
                        isPast={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <div className="text-center mb-10">
                    <span className="text-xs font-semibold text-foreground-400 uppercase tracking-widest mb-2 block">
                      {t('pastCount', { count: pastEvents.length })}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground-400 font-heading">
                      {t('lookBack')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 opacity-60">
                    {pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        isPast
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground-950/50 backdrop-blur-sm" onClick={() => setRegisterModal(null)} />
          <div className="relative z-10 bg-background-50 rounded-lg w-full max-w-sm p-6 shadow-lg">
            {regStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <i className="ri-check-line text-2xl text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground-900 mb-1">{t('youreRegistered')}</h3>
                <p className="text-sm text-foreground-500">{t('registeredDesc')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-foreground-950 font-heading">{t('registerForEvent')}</h3>
                  <button
                    onClick={() => setRegisterModal(null)}
                    className="w-8 h-8 flex items-center justify-center text-foreground-400 hover:text-foreground-600 rounded-md hover:bg-background-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-lg" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('yourName')}</label>
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-800 mb-1.5">{t('phoneNumber')}</label>
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder={t('phonePlaceholderEg')}
                      className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                    />
                  </div>

                  {regStatus === 'error' && (
                    <p className="text-xs text-accent-600 bg-accent-50 px-3 py-2 rounded-md">{regError}</p>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={regStatus === 'submitting' || !regForm.name.trim() || !regForm.phone.trim()}
                    className={cn(
                      'w-full py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                      regStatus === 'submitting' || !regForm.name.trim() || !regForm.phone.trim()
                        ? 'bg-background-200 text-foreground-400 cursor-not-allowed'
                        : 'bg-primary-500 text-background-50 hover:bg-primary-600 active:scale-[0.98]'
                    )}
                  >
                    {regStatus === 'submitting' ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin" />
                        {t('registering')}
                      </span>
                    ) : (
                      t('confirmRegistration')
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${import.meta.env.VITE_SITE_URL}/events#page`,
            name: 'Events &amp; Gatherings — Milano Pizza Hurghada',
            description: 'Join special dining events and gatherings at Milano Pizza in Hurghada. Pizza nights, tasting events, and celebrating experiences. Register now.',
            url: `${import.meta.env.VITE_SITE_URL}/events`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${import.meta.env.VITE_SITE_URL}/#website`,
              name: 'Milano Pizza',
              url: import.meta.env.VITE_SITE_URL,
            },
            ...(upcomingEvents.length > 0 && {
              mainEntity: upcomingEvents.map((event) => ({
                '@type': 'Event',
                name: event.title_en,
                description: (event.description_en || event.description_ar || ''),
                image: event.image_url || undefined,
                startDate: event.event_date,
                location: {
                  '@type': 'Place',
                  name: 'Milano Pizza',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Hurghada',
                    addressRegion: 'Red Sea Governorate',
                    addressCountry: 'EG',
                  },
                },
                organizer: {
                  '@type': 'Organization',
                  name: 'Milano Pizza',
                  url: import.meta.env.VITE_SITE_URL,
                },
              })),
            }),
          }),
        }}
      />
    </div>
  );
}

function EventCard({
  event,
  formatDate,
  formatTime,
  onRegister,
  isPast,
}: {
  event: Event;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  onRegister?: () => void;
  isPast: boolean;
}) {
  const { t } = useTranslation('common');

  return (
    <div className="group rounded-lg border border-background-200/70 bg-background-50 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="h-48 md:h-56 overflow-hidden relative">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title_en}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-background-100 flex items-center justify-center">
            <i className="ri-calendar-event-line text-4xl text-foreground-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-50/90 backdrop-blur-sm text-xs font-semibold text-foreground-800 shadow-sm">
            <i className="ri-calendar-line text-sm w-4 h-4 flex items-center justify-center" />
            {formatDate(event.event_date)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-500 text-background-50 text-[10px] font-semibold whitespace-nowrap">
            <i className="ri-time-line text-xs w-3 h-3 flex items-center justify-center" />
            {formatTime(event.event_date)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-base md:text-lg font-bold text-foreground-950 font-heading mb-1">
          {event.title_en}
        </h3>
        {event.title_ar && (
          <p className="text-xs text-foreground-400 mb-3">{event.title_ar}</p>
        )}
        <p className="text-sm text-foreground-600 leading-relaxed line-clamp-3 mb-4">
          {event.description_en || event.description_ar || ''}
        </p>

        {!isPast && onRegister && (
          <button
            onClick={onRegister}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-background-50 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line text-base w-4 h-4 flex items-center justify-center" />
            {t('registerNow')}
          </button>
        )}

        {isPast && (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-400">
            <i className="ri-check-double-line text-sm w-4 h-4 flex items-center justify-center" />
            {t('eventEnded')}
          </span>
        )}
      </div>
    </div>
  );
}