import { useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseModal } from '../../../components/base/BaseModal';
import { BaseSelect } from '../../../components/base/BaseSelect';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { OrderStepIndicator, StatusBadge } from '../../../components/common/StatusBadge';
import { ORDER_STATUS } from '../../../constants/orderStatus';
import type { OrderStatus } from '../../../constants/orderStatus';
import { getApiErrorMessage } from '../../../utils/error';
import { OrderForm } from '../components/OrderForm';
import { useOrders } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import type { Order } from '../../../types';

export function OrdersPage() {
  const { orders, loading, error, refreshOrders } = useOrders();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const nextStatuses = (status: string) => {
    const idx = ORDER_STATUS.indexOf(status as OrderStatus);
    return idx >= 0 && idx < ORDER_STATUS.length - 1 ? [ORDER_STATUS[idx + 1]] : [];
  };

  const onCreate = async (payload: Omit<Order, 'id' | 'status' | 'total_price'>, resetForm: () => void) => {
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
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Status update failed'), 'error');
    }
  };

  const columns = [
    { key: 'order_number', title: 'Order #'},
    { key: 'customer_name', title: 'Customer' },
    { key: 'total_price', title: 'Price' },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'lifecycle',
      title: 'Lifecycle',
      render: (_, row) => <OrderStepIndicator currentStatus={row.status} />,
    },
    {
      key: 'action',
      title: 'Action',
      render: (_, row) => {
        const [target] = nextStatuses(row.status);
        return target ? (
          <BaseButton onClick={() => transitionStatus(row.id, row.status)}>Move to {target}</BaseButton>
        ) : (
          <span className='text-xs text-slate-400'>Completed</span>
        );
      },
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>Orders</h2>
          <p className='text-sm text-slate-500'>Create and manage order lifecycle</p>
        </div>
        <BaseButton onClick={() => setShowCreate(true)}>+ New Order</BaseButton>
      </div>

      {error && <div className='rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700'>{error}</div>}
      {loading ? <BaseLoader /> : <BaseTable columns={columns} data={orders} />}

      <BaseModal open={showCreate} title='Create Order' onClose={() => setShowCreate(false)}>
        <OrderForm onSubmit={onCreate} loading={creating} />
      </BaseModal>
    </div>
  );
}
