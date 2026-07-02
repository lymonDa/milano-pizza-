import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/base/Input';
import { Button } from '@/components/base/Button';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { cn } from '@/lib/utils';

export default function Register() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { setBranch: saveBranch } = useBranch();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    if (!selectedBranch) {
      setError(t('pleaseSelectBranch'));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            branch: selectedBranch,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Save branch to context (will sync to profiles)
        await saveBranch(selectedBranch);
        navigate(redirectTo);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('somethingWentWrong');
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError(t('emailAlreadyExists'));
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
            <i className="ri-user-add-line text-background-50 text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950 mb-2">
            {t('createAccount')}
          </h1>
          <p className="text-foreground-600 text-sm">{t('registerDesc')}</p>
        </div>

        <form onSubmit={handleRegister} className="bg-background-100 border border-background-200/70 rounded-lg p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-accent-50 border border-accent-200/70 text-accent-700 text-sm">
              <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                <i className="ri-error-warning-line" />
              </span>
              <span>{error}</span>
            </div>
          )}

          <Input
            label={t('fullName')}
            type="text"
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            label={t('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label={t('phone')}
            type="tel"
            placeholder={t('phonePlaceholderLogin')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />

          {/* Branch Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground-700 mb-2">
              {t('selectYourBranch')} <span className="text-accent-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'arabia' as Branch, nameKey: 'branchArabia' },
                { key: 'dahar' as Branch, nameKey: 'branchDahar' },
              ]).map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setSelectedBranch(b.key)}
                  className={cn(
                    'py-3 px-3 rounded-md border-2 text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap',
                    selectedBranch === b.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-background-200/70 bg-background-50 text-foreground-600 hover:border-primary-200'
                  )}
                >
                  <span className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    selectedBranch === b.key
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-background-300'
                  )}>
                    {selectedBranch === b.key && <i className="ri-check-line text-[10px] text-background-50" />}
                  </span>
                  {t(b.nameKey)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            helper={t('passwordHelper')}
          />

          <Input
            label={t('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="flex items-center gap-1">
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
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {t('register')}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-foreground-600">
          {t('hasAccount')}{' '}
          <Link
            to={`/login${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}