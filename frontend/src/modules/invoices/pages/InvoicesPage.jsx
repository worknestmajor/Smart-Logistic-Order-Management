import { useEffect, useState } from 'react';
import { BaseButton } from '../../../components/base/BaseButton';
import { BaseDatePicker } from '../../../components/base/BaseDatePicker';
import { BaseForm } from '../../../components/base/BaseForm';
import { BaseInput } from '../../../components/base/BaseInput';
import { BaseLoader } from '../../../components/base/BaseLoader';
import { BaseSelect } from '../../../components/base/BaseSelect';
import { BaseTable } from '../../../components/base/BaseTable';
import { useToast } from '../../../components/base/BaseToast';
import { getApiErrorMessage } from '../../../utils/error';
import { invoiceService } from '../services/invoiceService';
import { orderService } from '../../orders/services/orderService';

export function InvoicesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', order: '', due_date: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, ordRes] = await Promise.all([invoiceService.list(), orderService.list()]);
      setItems(invRes?.data?.results || invRes?.data || []);
      setOrders((ordRes?.data?.results || ordRes?.data || []).filter((o) => o.status === 'DELIVERED'));
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to fetch invoices'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      await invoiceService.create(form);
      setForm({ invoice_number: '', order: '', due_date: '' });
      showToast('Invoice created', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create invoice'), 'error');
    }
  };

  const issueInvoice = async (id) => {
    try {
      await invoiceService.issue(id);
      showToast('Invoice issued', 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to issue invoice'), 'error');
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Invoices</h2>
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
            { key: 'order', title: 'Order ID' },
            { key: 'amount', title: 'Amount' },
            { key: 'status', title: 'Status' },
            {
              key: 'action',
              title: 'Action',
              render: (_, row) => row.status === 'DRAFT' ? <BaseButton onClick={() => issueInvoice(row.id)}>Issue</BaseButton> : 'Issued',
            },
          ]}
          data={items}
        />
      )}
    </div>
  );
}
