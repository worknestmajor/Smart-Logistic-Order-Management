import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Package, Truck, UserRound, Route, ReceiptText, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/dashboard/drivers', label: 'Drivers', icon: UserRound },
  { to: '/dashboard/assignments', label: 'Assignments', icon: Route },
  { to: '/dashboard/invoices', label: 'Invoices', icon: ReceiptText },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 border-r border-slate-200 bg-slate-900 p-4 text-slate-100'>
        <Link to='/dashboard/orders' className='mb-6 block text-lg font-bold'>
          Logistics OMS
        </Link>
        <nav className='space-y-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'}`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className='flex-1'>
        <header className='flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4'>
          <div>
            <h1 className='text-xl font-bold text-slate-800'>Logistics Dashboard</h1>
            <p className='text-xs text-slate-500'>Manage orders, assignments, and invoices</p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-sm text-slate-600'>{user?.email || 'User'}</span>
            <button
              type='button'
              className='inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white'
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <section className='p-6'>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
