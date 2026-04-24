import { useEffect, useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { getApiErrorMessage } from '../../../utils/error';
import { driverService } from '../services/driverService';
import type { Driver } from '../../../types';

export function DriversPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', license_number: '', phone: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await driverService.list();
      setItems(response?.data?.results || response?.data || []);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to fetch drivers'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await driverService.create({ ...form, is_available: true });
      setForm({ full_name: '', license_number: '', phone: '' });
      showToast('Driver created', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create driver'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Drivers</h2>
      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={onSubmit} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseInput label='Full Name' value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required />
          <BaseInput label='License Number' value={form.license_number} onChange={(e) => setForm((p) => ({ ...p, license_number: e.target.value }))} required />
          <BaseInput label='Phone' value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
          <div className='self-end'><BaseButton type='submit'>Add Driver</BaseButton></div>
        </BaseForm>
      </div>
      {loading ? <BaseLoader /> : <BaseTable columns={[{ key: 'full_name', title: 'Name' }, { key: 'license_number', title: 'License' }, { key: 'phone', title: 'Phone' }, { key: 'is_available', title: 'Available', render: (v) => (v ? 'Yes' : 'No') }]} data={items} />}
    </div>
  );
}
