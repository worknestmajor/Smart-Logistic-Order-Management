import { cn } from '../../utils/cn';

export function BaseButton({ children, variant = 'primary', className, ...props }) {
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];

  return (
    <button
      className={cn('rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', variantClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
