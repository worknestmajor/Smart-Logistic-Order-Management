import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import type { SelectOption } from '../../types';

interface BaseSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
}

export function BaseSelect({ label, options = [], error, className, ...props }: BaseSelectProps) {
  return (
    <label className='flex w-full flex-col gap-1'>
      {label && <span className='text-sm font-medium text-slate-700'>{label}</span>}
      <select
        className={cn('w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none', className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className='text-xs text-red-600'>{error}</span>}
    </label>
  );
}
