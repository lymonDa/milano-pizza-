import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/base/Modal';
import { Button } from '@/components/base/Button';
import { useNavigate } from 'react-router-dom';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId: string;
}

export function OrderConfirmationModal({ isOpen, onClose, orderNumber, orderId }: OrderConfirmationModalProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-4">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-double-line text-primary-600 text-2xl" />
        </div>

        <h2 className="text-xl font-bold text-foreground-950 font-heading mb-2">
          {t('orderConfirmedTitle')}
        </h2>
        <p className="text-sm text-foreground-500 mb-2">
          {t('orderConfirmedDesc')}
        </p>

        {/* Admin will call note */}
        <div className="flex items-start gap-2.5 bg-secondary-50 border border-secondary-200/70 rounded-lg p-3 mb-5 text-left">
          <span className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            <i className="ri-phone-line text-secondary-600" />
          </span>
          <p className="text-xs font-medium text-secondary-700">
            {t('adminWillCallNote')}
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-background-50 rounded-lg border border-background-200/70 p-4 mb-6">
          <p className="text-xs text-foreground-500 mb-1">{t('orderNumberLabel')}</p>
          <p className="text-lg font-bold text-primary-600 font-mono tracking-wider">
            #{orderNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => {
              onClose();
              navigate(`/order/${orderId}`);
            }}
          >
            {t('trackYourOrder')}
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-map-pin-line" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              onClose();
              navigate('/');
            }}
          >
            {t('backToHome')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}