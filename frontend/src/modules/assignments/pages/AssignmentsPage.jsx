import { useEffect, useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseSelect } from '../../../components/base/BaseSelect';
import { BaseTable } from '../../../components/base/BaseTable';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { useToast } from '../../../components/base/BaseToast';
import { getApiErrorMessage } from '../../../utils/error';
import { assignmentService } from '../services/assignmentService';
import { orderService } from '../../orders/services/orderService';
import { driverService } from '../../drivers/services/driverService';
import { vehicleService } from '../../vehicles/services/vehicleService';

export function AssignmentsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ order: '', driver: '', vehicle: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, oRes, dRes, vRes] = await Promise.all([
        assignmentService.list(),
        orderService.list(),
        driverService.list(),
        vehicleService.list(),
      ]);
      setItems(aRes?.data?.results || aRes?.data || []);
      setOrders((oRes?.data?.results || oRes?.data || []).filter((o) => o.status === 'APPROVED'));
      setDrivers((dRes?.data?.results || dRes?.data || []).filter((d) => d.is_available));
      setVehicles((vRes?.data?.results || vRes?.data || []).filter((v) => v.is_available));
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load assignments data'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.create(form);
      setForm({ order: '', driver: '', vehicle: '' });
      showToast('Assignment created', 'success');
      fetchAll();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create assignment'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Assignments</h2>
      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={onSubmit} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseSelect label='Order' value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} options={[{ value: '', label: 'Select Order' }, ...orders.map((o) => ({ value: o.id, label: `${o.order_number} (${o.status})` }))]} required />
          <BaseSelect label='Driver' value={form.driver} onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))} options={[{ value: '', label: 'Select Driver' }, ...drivers.map((d) => ({ value: d.id, label: d.full_name }))]} required />
          <BaseSelect label='Vehicle' value={form.vehicle} onChange={(e) => setForm((p) => ({ ...p, vehicle: e.target.value }))} options={[{ value: '', label: 'Select Vehicle' }, ...vehicles.map((v) => ({ value: v.id, label: v.number_plate }))]} required />
          <div className='self-end'><BaseButton type='submit'>Assign</BaseButton></div>
        </BaseForm>
      </div>
      {loading ? <BaseLoader /> : <BaseTable columns={[{ key: 'order', title: 'Order ID' }, { key: 'driver', title: 'Driver ID' }, { key: 'vehicle', title: 'Vehicle ID' }, { key: 'assigned_at', title: 'Assigned At' }]} data={items} />}
    </div>
  );
}
