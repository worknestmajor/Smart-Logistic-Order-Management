import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';
import { pricingService } from '../../../services/pricingService';
import type { OrderCreatePayload } from '../services/orderService';

const initialState = {
  customer_name: '',
  customer_email: '',
  pickup_address: '',
  dropoff_address: '',
  distance_km: '',
  weight_kg: '',
};

interface OrderFormProps {
  onSubmit: (payload: OrderCreatePayload, resetForm: () => void) => void | Promise<void>;
  loading: boolean;
}

export function OrderForm({ onSubmit, loading }: OrderFormProps) {
  const [form, setForm] = useState(initialState);
  const [pricingConfig, setPricingConfig] = useState<{
    base_rate_per_km: number;
    weight_rate_per_kg: number;
    fuel_surcharge_percent: number;
  } | null>(null);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const configs = await pricingService.list();
        const latest = configs[0];
        if (!latest) return;
        setPricingConfig({
          base_rate_per_km: Number(latest.base_rate_per_km || 0),
          weight_rate_per_kg: Number(latest.weight_rate_per_kg || 0),
          fuel_surcharge_percent: Number(latest.fuel_surcharge_percent || 0),
        });
      } catch {
        // Keep the form usable if pricing config endpoint is unavailable.
      }
    };
    loadPricing();
  }, []);

  const estimate = useMemo(() => {
    if (!pricingConfig) return null;
    const distance = Number(form.distance_km || 0);
    const weight = Number(form.weight_kg || 0);
    const base = distance * pricingConfig.base_rate_per_km + weight * pricingConfig.weight_rate_per_kg;
    const surcharge = (base * pricingConfig.fuel_surcharge_percent) / 100;
    const total = base + surcharge;
    return {
      base: base.toFixed(2),
      total: total.toFixed(2),
    };
  }, [form.distance_km, form.weight_kg, pricingConfig]);

  return (
    <BaseForm
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(form, () => setForm(initialState));
      }}
      className='grid grid-cols-1 gap-3 md:grid-cols-2'
    >
      <BaseInput label='Customer Name' value={form.customer_name} onChange={(e) => setField('customer_name', e.target.value)} required />
      <BaseInput label='Customer Email' type='email' value={form.customer_email} onChange={(e) => setField('customer_email', e.target.value)} required />
      <BaseInput label='Distance (KM)' type='number' step='0.01' value={form.distance_km} onChange={(e) => setField('distance_km', e.target.value)} required />
      <BaseInput label='Weight (KG)' type='number' step='0.01' value={form.weight_kg} onChange={(e) => setField('weight_kg', e.target.value)} required />
      <BaseInput label='Pickup Address' value={form.pickup_address} onChange={(e) => setField('pickup_address', e.target.value)} required />
      <BaseInput label='Dropoff Address' value={form.dropoff_address} onChange={(e) => setField('dropoff_address', e.target.value)} required />
      {estimate && (
        <div className='md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700'>
          <p>Estimated Base Price: {estimate.base}</p>
          <p>Estimated Total Price: {estimate.total}</p>
        </div>
      )}
      <div className='md:col-span-2'>
        <BaseButton type='submit' disabled={loading}>
          {loading ? 'Saving...' : 'Create Order'}
        </BaseButton>
      </div>
    </BaseForm>
  );
}
