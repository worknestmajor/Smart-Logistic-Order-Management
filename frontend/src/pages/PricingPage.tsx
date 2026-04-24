import { useEffect, useState } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { pricingService } from '../services/pricingService';
import { getApiErrorMessage } from '../utils/error';
import type { PricingConfig } from '../types';

export function PricingPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    base_rate_per_km: '',
    weight_rate_per_kg: '',
    fuel_surcharge_percent: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      setItems(await pricingService.list());
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to fetch pricing configurations'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await pricingService.create(form);
      setForm({ name: '', base_rate_per_km: '', weight_rate_per_kg: '', fuel_surcharge_percent: '' });
      showToast('Pricing config created', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create pricing config'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-xl font-bold text-slate-800'>Pricing</h2>
        <p className='text-sm text-slate-500'>Manage pricing rules used for order cost calculation.</p>
      </div>

      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={onSubmit} className='grid grid-cols-1 gap-3 md:grid-cols-5'>
          <BaseInput label='Config Name' value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <BaseInput label='Base Rate/KM' type='number' step='0.01' value={form.base_rate_per_km} onChange={(e) => setForm((prev) => ({ ...prev, base_rate_per_km: e.target.value }))} required />
          <BaseInput label='Weight Rate/KG' type='number' step='0.01' value={form.weight_rate_per_kg} onChange={(e) => setForm((prev) => ({ ...prev, weight_rate_per_kg: e.target.value }))} required />
          <BaseInput
            label='Fuel Surcharge %'
            type='number'
            step='0.01'
            value={form.fuel_surcharge_percent}
            onChange={(e) => setForm((prev) => ({ ...prev, fuel_surcharge_percent: e.target.value }))}
            required
          />
          <div className='self-end'>
            <BaseButton type='submit'>Add Config</BaseButton>
          </div>
        </BaseForm>
      </div>

      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'base_rate_per_km', title: 'Base/KM' },
            { key: 'weight_rate_per_kg', title: 'Weight/KG' },
            { key: 'fuel_surcharge_percent', title: 'Fuel %' },
          ]}
          data={items}
        />
      )}
    </div>
  );
}
