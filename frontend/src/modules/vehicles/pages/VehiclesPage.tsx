import { useEffect, useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { getApiErrorMessage } from '../../../utils/error';
import { vehicleService } from '../services/vehicleService';
import type { Vehicle } from '../../../types';

export function VehiclesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ number_plate: '', vehicle_type: '', capacity_kg: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.list();
      setItems(response?.data?.results || response?.data || []);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to fetch vehicles'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.create({ ...form, is_available: true });
      setForm({ number_plate: '', vehicle_type: '', capacity_kg: '' });
      showToast('Vehicle created', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create vehicle'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Vehicles</h2>
      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={onSubmit} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseInput label='Number Plate' value={form.number_plate} onChange={(e) => setForm((p) => ({ ...p, number_plate: e.target.value }))} required />
          <BaseInput label='Vehicle Type' value={form.vehicle_type} onChange={(e) => setForm((p) => ({ ...p, vehicle_type: e.target.value }))} required />
          <BaseInput label='Capacity (KG)' type='number' value={form.capacity_kg} onChange={(e) => setForm((p) => ({ ...p, capacity_kg: e.target.value }))} required />
          <div className='self-end'><BaseButton type='submit'>Add Vehicle</BaseButton></div>
        </BaseForm>
      </div>
      {loading ? <BaseLoader /> : <BaseTable columns={[{ key: 'number_plate', title: 'Plate' }, { key: 'vehicle_type', title: 'Type' }, { key: 'capacity_kg', title: 'Capacity' }, { key: 'is_available', title: 'Available', render: (v) => (v ? 'Yes' : 'No') }]} data={items} />}
    </div>
  );
}
