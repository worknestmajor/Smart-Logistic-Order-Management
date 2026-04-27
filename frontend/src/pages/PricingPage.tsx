import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseModal } from '../components/base/BaseModal';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { pricingService } from '../services/pricingService';
import { getApiErrorMessage } from '../utils/error';
import type { PricingConfig } from '../types';

export function PricingPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<PricingConfig | null>(null);
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

  const onUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    try {
      await pricingService.update(editing.id, editing);
      showToast('Pricing config updated', 'success');
      setEditing(null);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to update pricing config'), 'error');
    }
  };

  const onArchive = async (id: number) => {
    try {
      await pricingService.archive(id);
      showToast('Pricing config archived', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to archive pricing config'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-xl font-bold text-slate-800'>Pricing</h2>
        <p className='text-sm text-slate-500'>Manage pricing rules used for order cost calculation.</p>
      </div>
      <div>
        <BaseButton variant='secondary' onClick={fetchData}>Refresh</BaseButton>
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
            {
              key: 'action',
              title: 'Action',
              render: (_, row: PricingConfig) => (
                <div className='flex gap-2'>
                  <BaseButton variant='secondary' onClick={() => setEditing(row)}>Edit</BaseButton>
                  <BaseButton variant='danger' onClick={() => onArchive(row.id)}>Archive</BaseButton>
                </div>
              ),
            },
          ]}
          data={items}
        />
      )}

      <BaseModal open={!!editing} title='Edit Pricing Config' onClose={() => setEditing(null)}>
        {editing && (
          <BaseForm onSubmit={onUpdate} className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <BaseInput label='Config Name' value={editing.name} onChange={(e) => setEditing((prev) => prev ? ({ ...prev, name: e.target.value }) : prev)} required />
            <BaseInput
              label='Base Rate/KM'
              type='number'
              step='0.01'
              value={editing.base_rate_per_km}
              onChange={(e) => setEditing((prev) => prev ? ({ ...prev, base_rate_per_km: e.target.value }) : prev)}
              required
            />
            <BaseInput
              label='Weight Rate/KG'
              type='number'
              step='0.01'
              value={editing.weight_rate_per_kg}
              onChange={(e) => setEditing((prev) => prev ? ({ ...prev, weight_rate_per_kg: e.target.value }) : prev)}
              required
            />
            <BaseInput
              label='Fuel Surcharge %'
              type='number'
              step='0.01'
              value={editing.fuel_surcharge_percent}
              onChange={(e) => setEditing((prev) => prev ? ({ ...prev, fuel_surcharge_percent: e.target.value }) : prev)}
              required
            />
            <div className='md:col-span-2'>
              <BaseButton type='submit'>Save Changes</BaseButton>
            </div>
          </BaseForm>
        )}
      </BaseModal>
    </div>
  );
}
