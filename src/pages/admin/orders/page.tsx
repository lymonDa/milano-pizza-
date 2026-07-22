import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/base/Button';
import { StepIndicator } from '../../checkout/components/StepIndicator';
import { ReviewStep } from '../../checkout/components/ReviewStep';
import { AddressStep } from '../../checkout/components/AddressStep';
import { PaymentStep } from '../../checkout/components/PaymentStep';
import { OrderConfirmationModal } from '../../checkout/components/OrderConfirmationModal';

interface AddressFormData {
  fullName: string;
  phone: string;
  area: string;
  address: string;
  notes: string;
}

interface OrderResult {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
}

const STEPS = [
  { key: 'review', label: 'reviewOrder' },
  { key: 'address', label: 'deliveryDetails' },
  { key: 'payment', label: 'paymentInfo' },
];

export default function Checkout() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { items, subtotal, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [addressData, setAddressData] = useState<AddressFormData>({
    fullName: '',
    phone: '',
    area: '',
    address: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vodafone_cash' | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const translatedSteps = useMemo(
    () => STEPS.map((s) => ({ ...s, label: t(s.key) })),
    [t],
  );

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 pb-14 px-4 md:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Require login for checkout
  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-14 px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-user-line text-3xl text-foreground-300" />
          </div>
          <h2 className="text-lg font-semibold text-foreground-800 mb-2">
            Sign in to Checkout
          </h2>
          <p className="text-sm text-foreground-500 mb-6">
            You need an account to place an order. It only takes a moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/login?redirect=/checkout`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 text-background-50 rounded-md font-semibold text-sm hover:bg-primary-600 transition-all duration-200 whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              to={`/register?redirect=/checkout`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-background-300/60 text-foreground-700 rounded-md font-medium text-sm hover:bg-background-100 transition-all duration-200 whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to cart if empty
  if (items.length === 0 && !showConfirmation) {
    return (
      <div className="min-h-screen pt-20 pb-14 px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-background-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-shopping-bag-3-line text-3xl text-foreground-300" />
          </div>
          <h2 className="text-lg font-semibold text-foreground-800 mb-2">
            {t('cartEmpty')}
          </h2>
          <p className="text-sm text-foreground-500 mb-6">
            {t('cartEmptyDesc')}
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/menu')}>
            {t('startShopping')}
          </Button>
        </div>
      </div>
    );
  }

  const canProceedStep1 = items.length > 0;
  const canProceedStep2 =
    addressData.fullName.trim() !== '' &&
    addressData.phone.trim() !== '' &&
    addressData.area.trim() !== '' &&
    addressData.address.trim() !== '';
  const canProceedStep3 = paymentMethod !== null;
  const canPlaceOrder =
    canProceedStep3 &&
    (paymentMethod === 'cod' || (paymentMethod === 'vodafone_cash' && proofFile !== null));

  function handleNext() {
    setSubmitError('');
    if (currentStep === 0 && canProceedStep1) setCurrentStep(1);
    else if (currentStep === 1 && canProceedStep2) setCurrentStep(2);
  }

  function handleBack() {
    setSubmitError('');
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  async function handlePlaceOrder() {
    if (!canPlaceOrder || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let proofUrl: string | undefined;

      // Upload Vodafone Cash proof if applicable
      if (paymentMethod === 'vodafone_cash' && proofFile) {
        const filePath = `proofs/${user!.id}/${Date.now()}-${proofFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, proofFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Proof upload error:', uploadError);
          setSubmitError('Failed to upload payment proof. Please try again.');
          setIsSubmitting(false);
          return;
        }

        // The bucket is private, so getPublicUrl() would return a URL that
        // doesn't actually work. Store the raw storage path instead — the
        // admin panel exchanges it for a short-lived signed URL when it
        // needs to display the image.
        proofUrl = filePath;
      }

      // Call the create-order edge function
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            addons: item.addons.map((a) => ({
              id: a.id,
              name: a.name,
              price: a.price,
              quantity: a.quantity,
            })),
          })),
          address: {
            fullName: addressData.fullName.trim(),
            phone: addressData.phone.trim(),
            area: addressData.area.trim(),
            address: addressData.address.trim(),
            notes: addressData.notes.trim() || undefined,
          },
          paymentMethod,
          proofUrl,
        },
      });

      if (error) {
        console.error('Create order error:', error);
        // Try to extract the actual error from the response body
        let userMessage = 'Something went wrong while placing your order. Please try again.';
        try {
          if (error.context) {
            const errBody = await error.context.json();
            if (errBody?.error) {
              userMessage = errBody.error;
            }
          }
        } catch {
          // Fall back to generic message
        }
        setSubmitError(userMessage);
        setIsSubmitting(false);
        return;
      }

      if (!data?.success) {
        setSubmitError(data?.error || 'Failed to create order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success!
      setOrderResult({
        orderId: data.order.id,
        orderNumber: data.order.order_number,
        status: data.order.status,
        total: data.order.total,
      });
      clearCart();
      setShowConfirmation(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-14 px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground-950 text-center mb-6">
          {t('checkout')}
        </h1>

        <StepIndicator steps={translatedSteps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="bg-background-50 rounded-lg border border-background-200/70 p-5 md:p-6 mb-4">
          {currentStep === 0 && <ReviewStep />}
          {currentStep === 1 && (
            <AddressStep data={addressData} onChange={setAddressData} />
          )}
          {currentStep === 2 && (
            <PaymentStep
              method={paymentMethod}
              onSelect={setPaymentMethod}
              proofFile={proofFile}
              onFileSelect={setProofFile}
            />
          )}
        </div>

        {/* Error message */}
        {submitError && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-accent-50 text-accent-700 rounded-md text-sm">
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-error-warning-line" />
            </span>
            {submitError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={currentStep === 0 ? () => navigate('/cart') : handleBack}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line" />
            </span>
            {currentStep === 0 ? t('backToCart') : t('back')}
          </Button>

          {currentStep < 2 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !canProceedStep1) ||
                (currentStep === 1 && !canProceedStep2)
              }
            >
              {t('next')}
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-right-line" />
              </span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder}
              isLoading={isSubmitting}
            >
              {t('placeOrder')} &mdash; {total} EGP
            </Button>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {orderResult && (
        <OrderConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          orderNumber={orderResult.orderNumber}
          orderId={orderResult.orderId}
        />
      )}
    </div>
  );
}