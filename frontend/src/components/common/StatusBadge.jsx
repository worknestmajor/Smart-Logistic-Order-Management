import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../../constants/orderStatus';

const colorMap = {
  CREATED: 'bg-slate-200 text-slate-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  INVOICED: 'bg-purple-100 text-purple-700',
};

export function StatusBadge({ status }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colorMap[status] || 'bg-slate-200 text-slate-700'}`}>{ORDER_STATUS_LABELS[status] || status}</span>;
}

export function OrderStepIndicator({ currentStatus }) {
  const currentIndex = ORDER_STATUS.indexOf(currentStatus);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {ORDER_STATUS.map((status, index) => (
        <div key={status} className='flex items-center gap-2'>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              index <= currentIndex ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {ORDER_STATUS_LABELS[status]}
          </span>
          {index < ORDER_STATUS.length - 1 && <span className='text-slate-400'>?</span>}
        </div>
      ))}
    </div>
  );
}
