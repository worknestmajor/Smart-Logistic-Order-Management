import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-emerald-100 p-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-lg'>
        <Outlet />
      </div>
    </div>
  );
}
