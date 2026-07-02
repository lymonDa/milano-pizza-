import { useTranslation } from 'react-i18next';
import { Input } from '@/components/base/Input';

interface AddressFormData {
  fullName: string;
  phone: string;
  area: string;
  address: string;
  notes: string;
}

interface AddressStepProps {
  data: AddressFormData;
  onChange: (data: AddressFormData) => void;
}

export function AddressStep({ data, onChange }: AddressStepProps) {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground-950 mb-4">
        {t('deliveryDetails')}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('fullName')}
            placeholder={t('nameExample')}
            required
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          />
          <Input
            label={t('phone')}
            placeholder="010 1234 5678"
            required
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </div>
        <Input
          label={t('area')}
          placeholder={t('areaPlaceholder')}
          required
          value={data.area}
          onChange={(e) => onChange({ ...data, area: e.target.value })}
        />
        <Input
          label={t('streetAddress')}
          placeholder={t('addressPlaceholder')}
          required
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-foreground-800 mb-1.5">
            {t('deliveryNotes')}
          </label>
          <textarea
            className="w-full px-3 py-2.5 text-sm rounded-md border border-background-300/60 bg-background-50 text-foreground-950 placeholder:text-foreground-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none"
            rows={3}
            placeholder={t('deliveryNotesPlaceholder')}
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            maxLength={300}
          />
          <p className="mt-1 text-xs text-foreground-400">
            {data.notes.length}/300
          </p>
        </div>
      </div>
    </div>
  );
}