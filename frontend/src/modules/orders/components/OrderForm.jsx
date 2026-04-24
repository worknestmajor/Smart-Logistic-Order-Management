import { useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';

const initialState = {
  order_number: '',
  customer_name: '',
  customer_email: '',
  pickup_address: '',
  dropoff_address: '',
  distance_km: '',
  weight_kg: '',
};

export function OrderForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <BaseForm
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form, () => setForm(initialState));
      }}
      className='grid grid-cols-1 gap-3 md:grid-cols-2'
    >
      <BaseInput label='Order Number' value={form.order_number} onChange={(e) => setField('order_number', e.target.value)} required />
      <BaseInput label='Customer Name' value={form.customer_name} onChange={(e) => setField('customer_name', e.target.value)} required />
      <BaseInput label='Customer Email' type='email' value={form.customer_email} onChange={(e) => setField('customer_email', e.target.value)} required />
      <BaseInput label='Distance (KM)' type='number' step='0.01' value={form.distance_km} onChange={(e) => setField('distance_km', e.target.value)} required />
      <BaseInput label='Weight (KG)' type='number' step='0.01' value={form.weight_kg} onChange={(e) => setField('weight_kg', e.target.value)} required />
      <BaseInput label='Pickup Address' value={form.pickup_address} onChange={(e) => setField('pickup_address', e.target.value)} required />
      <BaseInput label='Dropoff Address' value={form.dropoff_address} onChange={(e) => setField('dropoff_address', e.target.value)} required />
      <div className='md:col-span-2'>
        <BaseButton type='submit' disabled={loading}>
          {loading ? 'Saving...' : 'Create Order'}
        </BaseButton>
      </div>
    </BaseForm>
  );
}
