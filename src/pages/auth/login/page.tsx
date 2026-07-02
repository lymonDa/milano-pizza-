import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/base/Input';
import { Button } from '@/components/base/Button';

export default function Login() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      // Check if user has a branch set
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('branch')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profileError && !profile?.branch) {
          navigate('/select-branch', { replace: true });
          return;
        }
      }

      navigate(redirectTo);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('somethingWentWrong');
      if (msg.includes('Invalid login credentials')) {
        setError(t('invalidCredentials'));
      } else if (msg.includes('Email not confirmed')) {
        setError(t('emailNotConfirmed'));
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 md:px-6 lg:px-8 flex items-center justify-center bg-background-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-500 flex items-center justify-center">
            <i className="ri-restaurant-2-line text-background-50 text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950 mb-2">
            {t('welcomeBack')}
          </h1>
          <p className="text-foreground-600 text-sm">{t('loginDesc')}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-background-100 border border-background-200/70 rounded-lg p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-accent-50 border border-accent-200/70 text-accent-700 text-sm">
              <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ri-error-warning-line" />
              </span>
              <span>{error}</span>
            </div>
          )}

          <Input
            label={t('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <Input
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between mt-1.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-1 text-xs text-foreground-500 hover:text-foreground-700 transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </span>
                {showPassword ? t('hidePassword') : t('showPassword')}
              </button>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {t('login')}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-foreground-600">
          {t('noAccount')}{' '}
          <Link
            to={`/register${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}