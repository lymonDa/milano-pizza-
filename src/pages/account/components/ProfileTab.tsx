import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Input } from '@/components/base/Input';
import { Button } from '@/components/base/Button';

interface ProfileData {
  full_name: string;
  phone: string;
  notify_whatsapp: boolean;
  notify_email: boolean;
}

interface ProfileTabProps {
  user: User;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const { t } = useTranslation('common');
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    notify_whatsapp: true,
    notify_email: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, phone, notify_whatsapp, notify_email')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!cancelled && data) {
          setProfile({
            full_name: data.full_name || '',
            phone: data.phone || '',
            notify_whatsapp: data.notify_whatsapp ?? true,
            notify_email: data.notify_email ?? true,
          });
        }
      } catch {
        if (!cancelled) setError(t('somethingWentWrong'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [user.id, t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name.trim(),
          phone: profile.phone.trim(),
          notify_whatsapp: profile.notify_whatsapp,
          notify_email: profile.notify_email,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setSuccessMsg(t('profileUpdated'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError(t('somethingWentWrong'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-accent-50 border border-accent-200/70 text-accent-700 text-sm">
          <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            <i className="ri-error-warning-line" />
          </span>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-primary-50 border border-primary-200/70 text-primary-700 text-sm">
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <i className="ri-checkbox-circle-line" />
          </span>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-background-100 border border-background-200/70 rounded-lg">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <span className="text-primary-600 text-xl font-bold font-heading">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground-950 truncate">
            {profile.full_name || t('name')}
          </p>
          <p className="text-xs text-foreground-500 truncate">{user.email}</p>
        </div>
      </div>

      <Input
        label={t('fullName')}
        value={profile.full_name}
        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
        required
      />

      <Input
        label={t('phone')}
        type="tel"
        value={profile.phone}
        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        placeholder={t('phonePlaceholderLogin')}
      />

      <div className="bg-background-100 border border-background-200/70 rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-semibold text-foreground-900 font-heading">
          {t('notifications')}
        </h4>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-foreground-700">{t('whatsappNotifications')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={profile.notify_whatsapp}
            onClick={() => setProfile({ ...profile, notify_whatsapp: !profile.notify_whatsapp })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
              profile.notify_whatsapp ? 'bg-primary-500' : 'bg-background-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background-50 transition-transform duration-200 ${
                profile.notify_whatsapp ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-foreground-700">{t('emailNotifications')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={profile.notify_email}
            onClick={() => setProfile({ ...profile, notify_email: !profile.notify_email })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
              profile.notify_email ? 'bg-primary-500' : 'bg-background-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background-50 transition-transform duration-200 ${
                profile.notify_email ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSaving}
      >
        {t('save')}
      </Button>
    </form>
  );
}