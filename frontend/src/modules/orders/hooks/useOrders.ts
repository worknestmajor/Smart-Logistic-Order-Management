import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { getApiErrorMessage } from '../../../utils/error';
import type { Order } from '../../../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.list();
      const payload = response?.data?.results || response?.data || [];
      setOrders(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refreshOrders: fetchOrders };
}
