import { cn } from '../../utils/cn';

export function BaseInput({ label, error, className, ...props }) {
  return (
    <label className='flex w-full flex-col gap-1'>
      {label && <span className='text-sm font-medium text-slate-700'>{label}</span>}
      <input
        className={cn('w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none', className)}
        {...props}
      />
      {error && <span className='text-xs text-red-600'>{error}</span>}
    </label>
  );
}
