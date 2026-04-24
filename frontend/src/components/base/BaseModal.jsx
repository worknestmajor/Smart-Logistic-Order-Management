import { BaseButton } from './BaseButton';

export function BaseModal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4'>
      <div className='w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-slate-800'>{title}</h3>
          <BaseButton variant='secondary' onClick={onClose}>
            Close
          </BaseButton>
        </div>
        {children}
      </div>
    </div>
  );
}
