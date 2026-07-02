import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBranch, type Branch } from '@/contexts/BranchContext';
import { cn } from '@/lib/utils';

const branches: { key: Branch extends infer T ? T : never; nameKey: string; descKey: string; icon: string; color: string }[] = [
  {
    key: 'arabia' as Branch,
    nameKey: 'branchArabia',
    descKey: 'branchArabiaDesc',
    icon: 'ri-building-2-line',
    color: 'from-amber-500 to-orange-600',
  },
  {
    key: 'dahar' as Branch,
    nameKey: 'branchDahar',
    descKey: 'branchDaharDesc',
    icon: 'ri-building-line',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function BranchSelectionPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { branch: currentBranch, setBranch } = useBranch();
  const [selected, setSelected] = useState<Branch>(currentBranch);
  const [isSaving, setIsSaving] = useState(false);
  const isSwitching = currentBranch !== null;

  // Pre-select current branch when switching
  useEffect(() => {
    if (currentBranch) {
      setSelected(currentBranch);
    }
  }, [currentBranch]);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSaving(true);
    await setBranch(selected);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50 px-4 md:px-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500 flex items-center justify-center">
            <i className="ri-map-pin-line text-3xl text-background-50" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950 mb-2">
            {isSwitching ? t('switchBranch') : t('selectYourBranch')}
          </h1>
          <p className="text-sm text-foreground-600 max-w-sm mx-auto">
            {isSwitching ? t('switchBranchDesc') : t('selectYourBranchDesc')}
          </p>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {branches.map((b) => {
            const isSelected = selected === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setSelected(b.key)}
                className={cn(
                  'relative p-5 rounded-lg border-2 text-left transition-all duration-200 cursor-pointer group',
                  isSelected
                    ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                    : 'border-background-200/70 bg-background-50 hover:border-primary-200 hover:bg-background-100'
                )}
              >
                {/* Gradient bar on top when selected */}
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-1 rounded-t-md bg-gradient-to-r transition-opacity duration-200',
                    b.color,
                    isSelected ? 'opacity-100' : 'opacity-0'
                  )}
                />

                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200',
                      isSelected
                        ? 'bg-primary-500 text-background-50'
                        : 'bg-background-100 text-foreground-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                    )}
                  >
                    <i className={cn(b.icon, 'text-xl')} />
                  </div>
                  <div>
                    <h3
                      className={cn(
                        'text-base font-bold font-heading transition-colors',
                        isSelected ? 'text-primary-700' : 'text-foreground-900'
                      )}
                    >
                      {t(b.nameKey)}
                    </h3>
                    <p className="text-xs text-foreground-500 mt-1 leading-relaxed">
                      {t(b.descKey)}
                    </p>
                  </div>
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-sm text-background-50" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <button
          disabled={!selected || isSaving}
          onClick={handleConfirm}
          className={cn(
            'w-full py-3.5 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
            selected && !isSaving
              ? 'bg-primary-500 text-background-50 hover:bg-primary-600 active:scale-[0.98]'
              : 'bg-background-200 text-foreground-400 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <i className="ri-arrow-right-line text-lg" />
              {t('confirmBranch')}
            </>
          )}
        </button>

        <p className="text-center mt-4 text-xs text-foreground-400">
          {t('branchCanChangeLater')}
        </p>
      </div>
    </div>
  );
}