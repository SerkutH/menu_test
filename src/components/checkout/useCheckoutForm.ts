import { useState, useCallback } from 'react';
import { CheckoutFormData, CheckoutFieldErrors, OrderMode } from '../../types';

const INITIAL_FORM: CheckoutFormData = {
  mode: 'delivery',
  fullName: '',
  phone: '',
  email: '',
  addressLine: '',
  buildingNo: '',
  district: '',
  city: 'İstanbul',
  deliveryNote: '',
  pinLat: 40.9808,
  pinLng: 29.0562,
};

// Turkish phone: +90 5XX XXX XXXX or 05XX XXX XXXX — 10 digits after country code
const TURKISH_PHONE_RE = /^(\+90|0)?5\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripPhoneFormatting(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

export function validateField(
  name: keyof CheckoutFormData,
  value: string,
  mode: OrderMode
): string | undefined {
  switch (name) {
    case 'fullName':
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return undefined;

    case 'phone': {
      const cleaned = stripPhoneFormatting(value);
      if (!cleaned) return 'Phone number is required';
      if (!TURKISH_PHONE_RE.test(cleaned))
        return 'Enter a valid Turkish phone number (+90 5XX XXX XXXX)';
      return undefined;
    }

    case 'email':
      if (value && !EMAIL_RE.test(value)) return 'Enter a valid email address';
      return undefined;

    case 'addressLine':
      if (mode === 'delivery' && !value.trim()) return 'Address is required for delivery';
      return undefined;

    case 'buildingNo':
      if (mode === 'delivery' && !value.trim()) return 'Building / Apt number is required';
      return undefined;

    case 'district':
      if (mode === 'delivery' && !value) return 'Please select a district';
      return undefined;

    default:
      return undefined;
  }
}

export function useCheckoutForm(whatsappPhone?: string) {
  const [form, setForm] = useState<CheckoutFormData>({
    ...INITIAL_FORM,
    phone: whatsappPhone || '',
  });
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormData, boolean>>>({});

  const setField = useCallback(
    <K extends keyof CheckoutFormData>(name: K, value: CheckoutFormData[K]) => {
      setForm((prev) => ({ ...prev, [name]: value }));
      // Clear error on change if field was touched
      if (touched[name]) {
        const error = validateField(
          name,
          String(value),
          name === 'mode' ? (value as OrderMode) : form.mode
        );
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, form.mode]
  );

  const handleBlur = useCallback(
    (name: keyof CheckoutFormData) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, String(form[name]), form.mode);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [form]
  );

  const validateAll = useCallback((): boolean => {
    const fieldsToValidate: (keyof CheckoutFormData)[] = [
      'fullName',
      'phone',
      'email',
      ...(form.mode === 'delivery'
        ? (['addressLine', 'buildingNo', 'district'] as const)
        : []),
    ];

    const newErrors: CheckoutFieldErrors = {};
    const newTouched: Partial<Record<keyof CheckoutFormData, boolean>> = {};
    let isValid = true;

    for (const field of fieldsToValidate) {
      newTouched[field] = true;
      const error = validateField(field, String(form[field]), form.mode);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  }, [form]);

  const setMode = useCallback(
    (mode: OrderMode) => {
      setForm((prev) => ({ ...prev, mode }));
      // Clear delivery-specific errors when switching to pickup
      if (mode === 'pickup') {
        setErrors((prev) => ({
          ...prev,
          addressLine: undefined,
          buildingNo: undefined,
          district: undefined,
        }));
      }
    },
    []
  );

  return { form, errors, touched, setField, handleBlur, validateAll, setMode };
}
