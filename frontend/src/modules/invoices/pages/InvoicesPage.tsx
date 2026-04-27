import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseDatePicker } from '../../../components/base/BaseDatePicker';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseSelect } from '../../../components/base/BaseSelect';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { getApiErrorMessage } from '../../../utils/error';
import { invoiceService } from '../services/invoiceService';
import { orderService } from '../../orders/services/orderService';
import type { Invoice, Order } from '../../../types';

export function InvoicesPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Invoice[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', order: '', due_date: '' });
  const statusFilter = searchParams.get('status') || '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoiceList, orderList] = await Promise.all([invoiceService.list(), orderService.list()]);
      setItems(invoiceList);
      setAllOrders(orderList);
      setOrders(orderList.filter((o) => o.status === 'DELIVERED'));
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to fetch invoices'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await invoiceService.create({ ...form, order: form.order });
      setForm({ invoice_number: '', order: '', due_date: '' });
      showToast('Invoice created', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create invoice'), 'error');
    }
  };

  const issueInvoice = async (id: number) => {
    try {
      await invoiceService.issue(id);
      showToast('Invoice issued', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to issue invoice'), 'error');
    }
  };

  const orderMap = new Map(allOrders.map((order) => [String(order.id), order]));
  const filteredItems = statusFilter ? items.filter((item) => item.status === statusFilter) : items;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Invoices</h2>
          {statusFilter && <p className='text-xs text-blue-700'>Filtered by {statusFilter}. <Link to='/dashboard/invoices' className='underline'>Clear</Link></p>}
        </div>
        <BaseButton variant='secondary' onClick={fetchData}>Refresh</BaseButton>
      </div>
      <div className='rounded-xl border bg-white p-4'>
        <BaseForm onSubmit={createInvoice} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseInput label='Invoice Number' value={form.invoice_number} onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))} required />
          <BaseSelect label='Order' value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} options={[{ value: '', label: 'Select Delivered Order' }, ...orders.map((o) => ({ value: o.id, label: o.order_number }))]} required />
          <BaseDatePicker label='Due Date' value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} required />
          <div className='self-end'><BaseButton type='submit'>Create Invoice</BaseButton></div>
        </BaseForm>
      </div>
      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            { key: 'invoice_number', title: 'Invoice #' },
            {
              key: 'order',
              title: 'Order',
              render: (value: unknown) => <Link className='text-blue-700 hover:underline' to={`/dashboard/orders?orderId=${String(value)}`}>{orderMap.get(String(value))?.order_number || String(value)}</Link>,
            },
            { key: 'amount', title: 'Amount' },
            { key: 'status', title: 'Status', render: (value: unknown) => <StatusBadge status={String(value)} /> },
            { key: 'due_date', title: 'Due Date' },
            { key: 'issued_at', title: 'Issued At' },
            {
              key: 'action',
              title: 'Action',
              render: (_, row) => row.status === 'DRAFT' ? <BaseButton onClick={() => issueInvoice(row.id)}>Issue</BaseButton> : 'Issued',
            },
          ]}
          data={filteredItems}
        />
      )}
    </div>
  );
}
