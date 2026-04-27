import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import type { Assignment, Driver, Order, Vehicle } from '../../../types';

export function AssignmentsPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Assignment[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ order: '', driver: '', vehicle: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [assignmentList, orderList, driverList, vehicleList] = await Promise.all([
        assignmentService.list(),
        orderService.list(),
        driverService.list(),
        vehicleService.list(),
      ]);
      setItems(assignmentList);
      setAllOrders(orderList);
      const approvedOrders = orderList.filter((order) => order.status === 'APPROVED');
      setOrders(approvedOrders);
      setAllDrivers(driverList);
      setDrivers(driverList.filter((driver) => driver.is_available));
      setAllVehicles(vehicleList);
      setVehicles(vehicleList.filter((vehicle) => vehicle.is_available));
      const preselectedOrderId = searchParams.get('orderId');
      if (preselectedOrderId && approvedOrders.some((order) => String(order.id) === preselectedOrderId)) {
        setForm((prev) => ({ ...prev, order: preselectedOrderId }));
      }
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load assignments data'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    try {
      await assignmentService.create({
        order: form.order,
        driver: form.driver,
        vehicle: form.vehicle,
      });
      setForm({ order: '', driver: '', vehicle: '' });
      showToast('Assignment created', 'success');
      fetchAll();
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to create assignment');
      setFormError(message);
      showToast(message, 'error');
    }
  };

  const orderMap = useMemo(() => new Map(allOrders.map((order) => [String(order.id), order])), [allOrders]);
  const driverMap = useMemo(() => new Map(allDrivers.map((driver) => [String(driver.id), driver])), [allDrivers]);
  const vehicleMap = useMemo(() => new Map(allVehicles.map((vehicle) => [String(vehicle.id), vehicle])), [allVehicles]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Assignments</h2>
          <p className='text-sm text-slate-500'>
            Only approved orders and available drivers/vehicles are shown.
          </p>
        </div>
        <BaseButton variant='secondary' onClick={fetchAll}>Refresh</BaseButton>
      </div>

      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={onSubmit} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseSelect
            label='Order'
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
            options={[{ value: '', label: `Select Order (${orders.length} available)` }, ...orders.map((o) => ({ value: o.id, label: `${o.order_number} (${o.status})` }))]}
            required
          />
          <BaseSelect
            label='Driver'
            value={form.driver}
            onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))}
            options={[{ value: '', label: `Select Driver (${drivers.length} available)` }, ...drivers.map((d) => ({ value: d.id, label: d.full_name }))]}
            required
          />
          <BaseSelect
            label='Vehicle'
            value={form.vehicle}
            onChange={(e) => setForm((p) => ({ ...p, vehicle: e.target.value }))}
            options={[{ value: '', label: `Select Vehicle (${vehicles.length} available)` }, ...vehicles.map((v) => ({ value: v.id, label: v.number_plate }))]}
            required
          />
          <div className='self-end'><BaseButton type='submit'>Assign</BaseButton></div>
        </BaseForm>
        {formError && <p className='mt-3 text-sm text-red-600'>{formError}</p>}
      </div>

      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            {
              key: 'order',
              title: 'Order',
              render: (value: unknown) => {
                const order = orderMap.get(String(value));
                return <Link className='text-blue-700 hover:underline' to={`/dashboard/orders?orderId=${String(value)}`}>{order?.order_number || String(value)}</Link>;
              },
            },
            {
              key: 'driver',
              title: 'Driver',
              render: (value: unknown) => driverMap.get(String(value))?.full_name || String(value),
            },
            {
              key: 'vehicle',
              title: 'Vehicle',
              render: (value: unknown) => vehicleMap.get(String(value))?.number_plate || String(value),
            },
            { key: 'assigned_at', title: 'Assigned At' },
          ]}
          data={items}
        />
      )}
    </div>
  );
}
