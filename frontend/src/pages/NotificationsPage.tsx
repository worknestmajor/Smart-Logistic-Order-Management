import { useEffect, useMemo, useState } from 'react';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseSelect } from '../components/base/BaseSelect';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { notificationService } from '../services/notificationService';
import { getApiErrorMessage } from '../utils/error';
import type { NotificationItem } from '../types';

export function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readFilter, setReadFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      setItems(await notificationService.list());
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load notifications'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const visibleItems = useMemo(() => {
    if (readFilter === 'all') return items;
    if (readFilter === 'read') return items.filter((item) => item.is_read);
    return items.filter((item) => !item.is_read);
  }, [items, readFilter]);

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div>
          <h2 className='text-xl font-bold text-slate-800'>Notifications</h2>
          <p className='text-sm text-slate-500'>Monitor workflow updates and actionable alerts.</p>
        </div>
        <div className='w-44'>
          <BaseSelect
            label='Filter'
            value={readFilter}
            onChange={(event) => setReadFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            { key: 'channel', title: 'Channel' },
            { key: 'subject', title: 'Subject' },
            { key: 'message', title: 'Message' },
            { key: 'is_read', title: 'Read', render: (value) => (value ? 'Yes' : 'No') },
          ]}
          data={visibleItems}
        />
      )}
    </div>
  );
}
