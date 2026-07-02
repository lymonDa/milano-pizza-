import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface PaymentStepProps {
  method: 'cod' | 'vodafone_cash' | null;
  onSelect: (method: 'cod' | 'vodafone_cash') => void;
  proofFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export function PaymentStep({ method, onSelect, proofFile, onFileSelect }: PaymentStepProps) {
  const { t } = useTranslation('common');
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground-950 mb-4">
        {t('paymentMethod')}
      </h2>

      {/* Payment Options */}
      <div className="space-y-3 mb-6">
        {/* COD */}
        <button
          onClick={() => onSelect('cod')}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer',
            method === 'cod'
              ? 'border-primary-500 bg-primary-50'
              : 'border-background-200/70 hover:border-background-300 bg-background-50'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            method === 'cod' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-500'
          )}>
            <i className="ri-money-dollar-circle-line text-lg" />
          </div>
          <div>
            <p className="font-medium text-foreground-900 text-sm">{t('cod')}</p>
            <p className="text-xs text-foreground-500 mt-0.5">{t('codDesc')}</p>
          </div>
          <div className="ml-auto">
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              method === 'cod' ? 'border-primary-500 bg-primary-500' : 'border-background-300'
            )}>
              {method === 'cod' && (
                <span className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-check-line text-background-50 text-[10px]" />
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Vodafone Cash */}
        <button
          onClick={() => onSelect('vodafone_cash')}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer',
            method === 'vodafone_cash'
              ? 'border-primary-500 bg-primary-50'
              : 'border-background-200/70 hover:border-background-300 bg-background-50'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            method === 'vodafone_cash' ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-500'
          )}>
            <i className="ri-smartphone-line text-lg" />
          </div>
          <div>
            <p className="font-medium text-foreground-900 text-sm">{t('vodafoneCash')}</p>
            <p className="text-xs text-foreground-500 mt-0.5">{t('vodafoneCashDesc')}</p>
          </div>
          <div className="ml-auto">
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              method === 'vodafone_cash' ? 'border-primary-500 bg-primary-500' : 'border-background-300'
            )}>
              {method === 'vodafone_cash' && (
                <span className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-check-line text-background-50 text-[10px]" />
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Vodafone Cash Upload */}
      {method === 'vodafone_cash' && (
        <div className="mt-4">
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200 mb-4">
            <p className="text-sm font-medium text-secondary-800 flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-information-line" />
              </span>
              {t('transferToNumber')} <strong>010 3356 1945</strong>
            </p>
          </div>

          <label className="block text-sm font-medium text-foreground-800 mb-1.5">
            {t('uploadProof')}
          </label>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                onFileSelect(file);
              }
            }}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-background-300/60 hover:border-background-400',
              proofFile ? 'bg-primary-50 border-primary-300' : 'bg-background-50'
            )}
          >
            {proofFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <i className="ri-check-double-line text-primary-600 text-lg" />
                </div>
                <p className="text-sm font-medium text-primary-700">{t('proofUploaded')}</p>
                <p className="text-xs text-foreground-500">{proofFile.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
                  className="text-xs text-accent-600 hover:text-accent-700 underline cursor-pointer"
                >
                  {t('changeFile')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <label className="w-full cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-1">
                    <i className="ri-upload-cloud-2-line text-foreground-500 text-lg" />
                  </div>
                  <p className="text-sm font-medium text-foreground-700">
                    {t('clickToUpload')}
                  </p>
                  <p className="text-xs text-foreground-400 mt-0.5">
                    {t('uploadHint')}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileSelect(file);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}