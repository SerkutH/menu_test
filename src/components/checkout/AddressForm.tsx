import { CheckoutFormData, CheckoutFieldErrors } from '../../types';
import FormField from './FormField';
import MapPin from './MapPin';
import { ChevronDown } from 'lucide-react';

interface Props {
  form: CheckoutFormData;
  errors: CheckoutFieldErrors;
  districts: string[];
  onFieldChange: <K extends keyof CheckoutFormData>(name: K, value: CheckoutFormData[K]) => void;
  onBlur: (name: keyof CheckoutFormData) => void;
}

const INPUT_BASE =
  'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all';
const INPUT_NORMAL = `${INPUT_BASE} border-gray-200 focus:ring-brand-200 focus:border-brand-400`;
const INPUT_ERROR = `${INPUT_BASE} border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/50`;

export default function AddressForm({ form, errors, districts, onFieldChange, onBlur }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center">
          2
        </span>
        Delivery Address
      </h3>

      <FormField label="Address Line" error={errors.addressLine} required>
        <input
          type="text"
          value={form.addressLine}
          onChange={(e) => onFieldChange('addressLine', e.target.value)}
          onBlur={() => onBlur('addressLine')}
          placeholder="Street name, neighbourhood"
          className={errors.addressLine ? INPUT_ERROR : INPUT_NORMAL}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Building / Apt No" error={errors.buildingNo} required>
          <input
            type="text"
            value={form.buildingNo}
            onChange={(e) => onFieldChange('buildingNo', e.target.value)}
            onBlur={() => onBlur('buildingNo')}
            placeholder="e.g. 5/12"
            className={errors.buildingNo ? INPUT_ERROR : INPUT_NORMAL}
          />
        </FormField>

        <FormField label="District" error={errors.district} required>
          <div className="relative">
            <select
              value={form.district}
              onChange={(e) => onFieldChange('district', e.target.value)}
              onBlur={() => onBlur('district')}
              className={`appearance-none pr-9 ${errors.district ? INPUT_ERROR : INPUT_NORMAL}`}
            >
              <option value="">Select...</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </FormField>
      </div>

      <FormField label="City">
        <input
          type="text"
          value={form.city}
          readOnly
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
        />
      </FormField>

      <FormField label="Delivery Note">
        <textarea
          value={form.deliveryNote}
          onChange={(e) => onFieldChange('deliveryNote', e.target.value)}
          placeholder="e.g. No ring, sleeping baby"
          rows={2}
          className={`${INPUT_NORMAL} resize-none`}
        />
      </FormField>

      {/* Map Pin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm your location
        </label>
        <MapPin
          lat={form.pinLat}
          lng={form.pinLng}
          onPinMove={(lat, lng) => {
            onFieldChange('pinLat', lat);
            onFieldChange('pinLng', lng);
          }}
        />
      </div>
    </div>
  );
}
