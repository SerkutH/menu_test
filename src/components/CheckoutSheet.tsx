import { useCallback, useState, useMemo } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Send, AlertTriangle, RotateCcw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Restaurant, OrderMode } from '../types';
import DeliveryToggle from './checkout/DeliveryToggle';
import AddressForm from './checkout/AddressForm';
import PickupInfo from './checkout/PickupInfo';
import ContactInfo from './checkout/ContactInfo';
import OrderSummary from './checkout/OrderSummary';
import { useCheckoutForm } from './checkout/useCheckoutForm';
import { buildOrderPayload, submitOrderToN8n } from '../services/orderApi';
import { getWhatsAppSession } from '../services/whatsapp';

interface Props {
  restaurant: Restaurant;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/** Generate a one-time idempotency key per checkout session */
function generateIdempotencyKey(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

export default function CheckoutSheet({ restaurant }: Props) {
  const items = useCartStore((s) => s.items);
  const closeCheckout = useCartStore((s) => s.closeCheckout);
  const openCart = useCartStore((s) => s.openCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDeliveryFee = useCartStore((s) => s.getDeliveryFee);
  const getTotal = useCartStore((s) => s.getTotal);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Idempotency key — generated once per checkout session, reused on retry
  const [idempotencyKey] = useState(generateIdempotencyKey);

  // WhatsApp session — parsed from URL params
  const waSession = useMemo(() => getWhatsAppSession(), []);
  const whatsappPhone = waSession?.phone;

  const { form, errors, setField, handleBlur, validateAll, setMode } =
    useCheckoutForm(whatsappPhone);

  // Pre-fill name from WhatsApp if available and field is empty
  useMemo(() => {
    if (waSession?.name && !form.fullName) {
      setField('fullName', waSession.name);
    }
  }, [waSession]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(form.mode);
  const total = getTotal(form.mode);

  const handleModeChange = useCallback(
    (mode: OrderMode) => {
      setMode(mode);
      useCartStore.getState().setOrderMode(mode);
    },
    [setMode]
  );

  const handleBackToCart = useCallback(() => {
    closeCheckout();
    openCart();
  }, [closeCheckout, openCart]);

  // ── Submit order to n8n ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Prevent double-submit
    if (submitState === 'submitting') return;

    // Validate form
    const isValid = validateAll();
    if (!isValid) {
      // Scroll to first visible error
      setTimeout(() => {
        const firstError = document.querySelector('.text-red-500');
        firstError?.closest('.space-y-4, [class*="FormField"]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 50);
      return;
    }

    setSubmitState('submitting');
    setErrorMessage('');

    // Build the structured payload
    const payload = buildOrderPayload(
      form,
      items,
      subtotal,
      deliveryFee,
      total,
      idempotencyKey,
      !!waSession
    );

    // Send to n8n
    const result = await submitOrderToN8n(payload);

    if (result.success) {
      setSubmitState('success');
    } else {
      setSubmitState('error');
      setErrorMessage(result.error || 'Something went wrong. Please try again.');
    }
  }, [submitState, validateAll, form, items, subtotal, deliveryFee, total, idempotencyKey, waSession]);

  const handleRetry = useCallback(() => {
    setSubmitState('idle');
    setErrorMessage('');
  }, []);

  // ── Success screen ─────────────────────────────────────────────────────
  if (submitState === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-slide-up">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Order Placed!</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your order has been received. {waSession ? "You'll get a confirmation on WhatsApp shortly." : "We're preparing your food."}
          </p>

          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
            <p className="font-medium">Estimated preparation time</p>
            <p className="text-lg font-bold text-brand-600 mt-0.5">{restaurant.prepTime}</p>
          </div>

          <button
            onClick={() => {
              closeCheckout();
              useCartStore.getState().clearCart();
            }}
            className="w-full mt-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          >
            Back to Menu
          </button>
        </div>

        <style>{`
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
      </div>
    );
  }

  // ── Main checkout form ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCheckout} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg md:mx-4 bg-gray-50 md:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white">
          <button
            onClick={handleBackToCart}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-1"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
            <p className="text-xs text-gray-400">{restaurant.name}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Delivery vs Pick-up Toggle */}
            <DeliveryToggle
              mode={form.mode}
              onModeChange={handleModeChange}
              deliveryAvailable={restaurant.deliveryAvailable}
              pickupAvailable={restaurant.pickupAvailable}
            />

            {/* Contact Info */}
            <ContactInfo
              form={form}
              errors={errors}
              whatsappPhone={whatsappPhone}
              onFieldChange={setField}
              onBlur={handleBlur}
            />

            {/* Address Form / Pick-up Info */}
            {form.mode === 'delivery' ? (
              <AddressForm
                form={form}
                errors={errors}
                districts={restaurant.districts}
                onFieldChange={setField}
                onBlur={handleBlur}
              />
            ) : (
              <PickupInfo
                location={restaurant.location}
                restaurantName={restaurant.name}
              />
            )}

            {/* Order Summary Review */}
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              mode={form.mode}
            />

            {/* Error Banner */}
            {submitState === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800">Order could not be placed</p>
                  <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                  title="Dismiss"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Security notice */}
            <div className="flex items-center gap-2 px-1 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Your order data is sent securely. Card details are never stored.</span>
            </div>
          </div>
        </div>

        {/* Footer: Place Order */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <button
            onClick={handleSubmit}
            disabled={submitState === 'submitting'}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              submitState === 'submitting'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : submitState === 'error'
                  ? 'bg-red-500 hover:bg-red-600 text-white active:scale-[0.98]'
                  : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98] shadow-lg shadow-brand-500/20'
            }`}
          >
            {submitState === 'idle' && (
              <>
                <Send className="w-4 h-4" />
                Place Order — ₺{total}
              </>
            )}
            {submitState === 'submitting' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing order...
              </>
            )}
            {submitState === 'error' && (
              <>
                <RotateCcw className="w-4 h-4" />
                Try Again — ₺{total}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
