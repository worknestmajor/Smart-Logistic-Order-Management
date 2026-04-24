import type { FormEventHandler, ReactNode } from 'react';

interface BaseFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  className?: string;
}

export function BaseForm({ onSubmit, children, className = '' }: BaseFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}
