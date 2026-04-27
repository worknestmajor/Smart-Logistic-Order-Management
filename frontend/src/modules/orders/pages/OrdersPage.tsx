import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseModal } from '../../../components/base/BaseModal';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { OrderStepIndicator, StatusBadge } from '../../../components/common/StatusBadge';
import { ORDER_STATUS } from '../../../constants/orderStatus';
import type { OrderStatus } from '../../../constants/orderStatus';
import type { Order } from '../../../types';
import { getApiErrorMessage } from '../../../utils/error';
import { OrderForm } from '../components/OrderForm';
import { useOrders } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import type { OrderCreatePayload } from '../services/orderService';
import { useAuthStore } from '../../../store/authStore';

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, refreshOrders } = useOrders();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState('');

  const statusFilter = searchParams.get('status') || '';
  const orderIdFilter = searchParams.get('orderId') || '';

  const nextStatuses = (status: string) => {
    const idx = ORDER_STATUS.indexOf(status as OrderStatus);
    return idx >= 0 && idx < ORDER_STATUS.length - 1 ? [ORDER_STATUS[idx + 1]] : [];
  };
  const isAdminUser = String(user?.role || '').toLowerCase() === 'admin';

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[AUTH DEBUG] Orders admin check', {
        role: user?.role,
        user_role: user?.user_role,
        isAdminUser,
      });
    }
  }, [user?.role, user?.user_role, isAdminUser]);

  const onCreate = async (payload: OrderCreatePayload, resetForm: () => void) => {
    setCreating(true);
    try {
      await orderService.create(payload);
      showToast('Order created successfully', 'success');
      resetForm();
      setShowCreate(false);
      refreshOrders();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Create order failed'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const transitionStatus = async (id: number, currentStatus: string) => {
    const [target] = nextStatuses(currentStatus);
    if (!target) return;
    try {
      await orderService.transition(id, target);
      showToast(`Order moved to ${target}`, 'success');
      refreshOrders();
      setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, status: target } : prev));
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Status update failed'), 'error');
    }
  };

  const handleFlowAction = async (row: Order) => {
    if (row.status === 'CREATED') {
      if (!isAdminUser) {
        showToast('Only admin can approve orders', 'error');
        return;
      }
      await transitionStatus(row.id, row.status);
      return;
    }
    if (row.status === 'APPROVED') {
      navigate(`/dashboard/assignments?orderId=${String(row.id)}`);
      return;
    }
    await transitionStatus(row.id, row.status);
  };

  const actionLabel = (row: Order) => {
    if (row.status === 'CREATED') return isAdminUser ? 'Move to APPROVED' : 'Awaiting Admin Approval';
    if (row.status === 'APPROVED') return 'Assign Driver & Vehicle';
    const [target] = nextStatuses(row.status);
    return target ? `Move to ${target}` : 'Completed';
  };

  const updateTracking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder || !trackingLocation) return;
    setUpdatingTracking(true);
    try {
      const updated = await orderService.tracking(selectedOrder.id, trackingLocation);
      setSelectedOrder(updated);
      setTrackingLocation('');
      showToast('Tracking updated', 'success');
      refreshOrders();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Tracking update failed'), 'error');
    } finally {
      setUpdatingTracking(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;
      if (orderIdFilter && String(order.id) !== orderIdFilter) return false;
      return true;
    });
  }, [orders, statusFilter, orderIdFilter]);

  const columns = [
    {
      key: 'order_number',
      title: 'Order #',
      render: (value: unknown, row: Order) => (
        <button type='button' className='text-blue-700 hover:underline' onClick={() => setSelectedOrder(row)}>
          {String(value)}
        </button>
      ),
    },
    { key: 'customer_name', title: 'Customer' },
    { key: 'total_price', title: 'Price' },
    {
      key: 'status',
      title: 'Status',
      render: (value: unknown) => <StatusBadge status={String(value)} />,
    },
    {
      key: 'lifecycle',
      title: 'Lifecycle',
      render: (_: unknown, row: Order) => <OrderStepIndicator currentStatus={row.status} />,
    },
    {
      key: 'action',
      title: 'Action',
      render: (_: unknown, row: Order) => {
        const [target] = nextStatuses(row.status);
        if (!target) {
          return <span className='text-xs text-slate-400'>Completed</span>;
        }
        const disabled = row.status === 'CREATED' && !isAdminUser;
        return (
          <BaseButton onClick={() => void handleFlowAction(row)} disabled={disabled}>
            {actionLabel(row)}
          </BaseButton>
        );
      },
    },
  ];

  const renderModalActionButtons = (order: Order) => {
    const [target] = nextStatuses(order.status);
    if (!target) {
      return <span className='text-xs text-slate-400'>Completed</span>;
    }
    const disabled = order.status === 'CREATED' && !isAdminUser;
    return (
      <BaseButton onClick={() => void handleFlowAction(order)} disabled={disabled}>
        {actionLabel(order)}
      </BaseButton>
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>Orders</h2>
          <p className='text-sm text-slate-500'>Create and manage order lifecycle</p>
          {(statusFilter || orderIdFilter) && (
            <p className='mt-1 text-xs text-blue-700'>
              Filter active:
              {statusFilter ? ` status=${statusFilter}` : ''}
              {orderIdFilter ? ` orderId=${orderIdFilter}` : ''} | <Link className='underline' to='/dashboard/orders'>Clear filter</Link>
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <BaseButton variant='secondary' onClick={refreshOrders}>
            Refresh
          </BaseButton>
          <BaseButton onClick={() => setShowCreate(true)}>+ New Order</BaseButton>
        </div>
      </div>

      {error && <div className='rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700'>{error}</div>}
      {loading ? <BaseLoader /> : <BaseTable columns={columns} data={filteredOrders} />}

      <BaseModal open={showCreate} title='Create Order' onClose={() => setShowCreate(false)}>
        <OrderForm onSubmit={onCreate} loading={creating} />
      </BaseModal>

      <BaseModal open={!!selectedOrder} title={`Order Details - ${selectedOrder?.order_number || ''}`} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='rounded-lg border border-slate-200 p-3'>
                <p className='text-xs text-slate-500'>Customer</p>
                <p className='font-medium text-slate-800'>{selectedOrder.customer_name}</p>
                <p className='text-sm text-slate-600'>{selectedOrder.customer_email || '-'}</p>
              </div>
              <div className='rounded-lg border border-slate-200 p-3'>
                <p className='text-xs text-slate-500'>Status</p>
                <div className='mt-1'><StatusBadge status={selectedOrder.status} /></div>
                <div className='mt-2'><OrderStepIndicator currentStatus={selectedOrder.status} /></div>
              </div>
              <div className='rounded-lg border border-slate-200 p-3'>
                <p className='text-xs text-slate-500'>Pickup</p>
                <p className='text-sm text-slate-700'>{selectedOrder.pickup_address || '-'}</p>
              </div>
              <div className='rounded-lg border border-slate-200 p-3'>
                <p className='text-xs text-slate-500'>Dropoff</p>
                <p className='text-sm text-slate-700'>{selectedOrder.dropoff_address || '-'}</p>
              </div>
            </div>

            <div className='rounded-lg border border-slate-200 p-3'>
              <p className='text-xs text-slate-500'>Pricing</p>
              <p className='text-sm text-slate-700'>Base: {selectedOrder.base_price ?? '-'}</p>
              <p className='text-sm text-slate-700'>Total: {selectedOrder.total_price ?? '-'}</p>
            </div>

            <div className='rounded-lg border border-slate-200 p-3'>
              <p className='text-xs text-slate-500'>Tracking</p>
              <p className='text-sm text-slate-700'>Current location: {selectedOrder.current_location || 'Not updated'}</p>
              <p className='text-xs text-slate-500'>Last update: {selectedOrder.last_location_update || '-'}</p>
              <form className='mt-3 flex gap-2' onSubmit={updateTracking}>
                <input
                  value={trackingLocation}
                  onChange={(event) => setTrackingLocation(event.target.value)}
                  placeholder='Enter latest location'
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                />
                <BaseButton type='submit' disabled={updatingTracking || !trackingLocation}>
                  {updatingTracking ? 'Updating...' : 'Update Tracking'}
                </BaseButton>
              </form>
            </div>

            <div className='flex items-center gap-2'>{renderModalActionButtons(selectedOrder)}</div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
