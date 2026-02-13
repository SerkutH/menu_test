import { CheckoutFormData, CheckoutFieldErrors } from '../../types';
import FormField from './FormField';
import { MessageCircle } from 'lucide-react';

interface Props {
  form: CheckoutFormData;
  errors: CheckoutFieldErrors;
  whatsappPhone?: string;
  onFieldChange: <K extends keyof CheckoutFormData>(name: K, value: CheckoutFormData[K]) => void;
  onBlur: (name: keyof CheckoutFormData) => void;
}

const INPUT_BASE =
  'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all';
const INPUT_NORMAL = `${INPUT_BASE} border-gray-200 focus:ring-brand-200 focus:border-brand-400`;
const INPUT_ERROR = `${INPUT_BASE} border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/50`;

export default function ContactInfo({
  form,
  errors,
  whatsappPhone,
  onFieldChange,
  onBlur,
}: Props) {
  const isPhoneFromWA = !!whatsappPhone;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
          1
        </span>
        Contact Information
      </h3>

      <FormField label="Full Name" error={errors.fullName} required>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => onFieldChange('fullName', e.target.value)}
          onBlur={() => onBlur('fullName')}
          placeholder="Your full name"
          className={errors.fullName ? INPUT_ERROR : INPUT_NORMAL}
        />
      </FormField>

      <FormField label="Phone Number" error={errors.phone} required>
        <div className="relative">
          {isPhoneFromWA && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-green-500" />
            </div>
          )}
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => !isPhoneFromWA && onFieldChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            readOnly={isPhoneFromWA}
            placeholder="+90 5XX XXX XXXX"
            className={`${errors.phone ? INPUT_ERROR : INPUT_NORMAL} ${
              isPhoneFromWA ? 'pl-9 bg-gray-50 cursor-not-allowed text-gray-500' : ''
            }`}
          />
        </div>
        {isPhoneFromWA && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Pre-filled from your WhatsApp session
          </p>
        )}
      </FormField>

      <FormField label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          onBlur={() => onBlur('email')}
          placeholder="For PDF receipt (optional)"
          className={errors.email ? INPUT_ERROR : INPUT_NORMAL}
        />
      </FormField>
    </div>
  );
}
