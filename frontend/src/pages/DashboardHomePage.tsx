import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BaseLoader } from '../components/base/BaseLoader';
import { useToast } from '../components/base/BaseToast';
import { assignmentService } from '../modules/assignments/services/assignmentService';
import { invoiceService } from '../modules/invoices/services/invoiceService';
import { orderService } from '../modules/orders/services/orderService';
import { notificationService } from '../services/notificationService';
import { getApiErrorMessage } from '../utils/error';
import type { Assignment, Invoice, NotificationItem, Order } from '../types';

const normalizeListPayload = (payload) => payload?.data?.results || payload?.data || [];

const cardStyle = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';

export function DashboardHomePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [ordersRes, assignmentsRes, invoicesRes, notificationsRes] = await Promise.all([
        orderService.list(),
        assignmentService.list(),
        invoiceService.list(),
        notificationService.list(),
      ]);
      setOrders(normalizeListPayload(ordersRes));
      setAssignments(normalizeListPayload(assignmentsRes));
      setInvoices(normalizeListPayload(invoicesRes));
      setNotifications(Array.isArray(notificationsRes) ? notificationsRes : []);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load dashboard summary'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const summary = useMemo(() => {
    const approvedOrders = orders.filter((order) => order.status === 'APPROVED');
    const inTransitOrders = orders.filter((order) => order.status === 'IN_TRANSIT');
    const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED');
    const invoicedOrders = orders.filter((order) => order.status === 'INVOICED');
    const unreadNotifications = notifications.filter((notification) => !notification.is_read);
    const issuedInvoices = invoices.filter((invoice) => invoice.status === 'ISSUED');

    return {
      totalOrders: orders.length,
      approvedOrders: approvedOrders.length,
      assignments: assignments.length,
      inTransitOrders: inTransitOrders.length,
      deliveredOrders: deliveredOrders.length,
      invoicedOrders: invoicedOrders.length,
      issuedInvoices: issuedInvoices.length,
      unreadNotifications: unreadNotifications.length,
    };
  }, [orders, assignments, invoices, notifications]);

  if (loading) return <BaseLoader />;

  return (
    <div className='space-y-5'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <div className={cardStyle}>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Orders</p>
          <p className='mt-2 text-2xl font-bold text-slate-800'>{summary.totalOrders}</p>
          <p className='mt-1 text-xs text-slate-500'>{summary.approvedOrders} approved</p>
        </div>
        <div className={cardStyle}>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Assignments</p>
          <p className='mt-2 text-2xl font-bold text-slate-800'>{summary.assignments}</p>
          <p className='mt-1 text-xs text-slate-500'>{summary.inTransitOrders} in transit</p>
        </div>
        <div className={cardStyle}>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Delivery</p>
          <p className='mt-2 text-2xl font-bold text-slate-800'>{summary.deliveredOrders}</p>
          <p className='mt-1 text-xs text-slate-500'>{summary.invoicedOrders} invoiced</p>
        </div>
        <div className={cardStyle}>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Alerts</p>
          <p className='mt-2 text-2xl font-bold text-slate-800'>{summary.unreadNotifications}</p>
          <p className='mt-1 text-xs text-slate-500'>{summary.issuedInvoices} issued invoices</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Link className={`${cardStyle} hover:border-blue-300`} to='/dashboard/orders'>
          <h3 className='font-semibold text-slate-800'>Create and Progress Orders</h3>
          <p className='mt-2 text-sm text-slate-600'>Track full lifecycle from created to invoiced.</p>
        </Link>
        <Link className={`${cardStyle} hover:border-blue-300`} to='/dashboard/assignments'>
          <h3 className='font-semibold text-slate-800'>Assign Driver and Vehicle</h3>
          <p className='mt-2 text-sm text-slate-600'>Pair approved orders with available fleet resources.</p>
        </Link>
        <Link className={`${cardStyle} hover:border-blue-300`} to='/dashboard/invoices'>
          <h3 className='font-semibold text-slate-800'>Issue Invoices</h3>
          <p className='mt-2 text-sm text-slate-600'>Generate invoices for delivered orders and track status.</p>
        </Link>
      </div>
    </div>
  );
}
