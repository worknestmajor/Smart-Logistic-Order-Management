import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, UserRound, Route, ReceiptText, ShieldCheck, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../modules/orders/services/orderService';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/assignments', label: 'Assignments', icon: Route },
  { to: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/dashboard/drivers', label: 'Drivers', icon: UserRound },
  { to: '/dashboard/invoices', label: 'Invoices', icon: ReceiptText },
];

const adminNavItems = [
  { to: '/dashboard/admin/users', label: 'Users' },
  { to: '/dashboard/admin/roles', label: 'Roles' },
  { to: '/dashboard/pricing', label: 'Pricing' },
  { to: '/dashboard/notifications', label: 'Notifications' },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ unassignedOrders: 0 });

  const canAccessAdminSection = useMemo(() => {
    const roleValues = [user?.role, user?.user_role, ...(Array.isArray(user?.roles) ? user.roles : [])]
      .filter(Boolean)
      .map((role) => String(role).toLowerCase());
    return roleValues.some((role) => role.includes('admin') || role.includes('manager'));
  }, [user]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const roleValues = [user?.role, user?.user_role, ...(Array.isArray(user?.roles) ? user.roles : [])]
        .filter(Boolean)
        .map((role) => String(role).toLowerCase());
      console.log('[AUTH DEBUG] Dashboard roles check', { user, roleValues, canAccessAdminSection });
    }
  }, [user, canAccessAdminSection]);

  const visibleNavItems = navItems;
  const isAdminSectionActive = adminNavItems.some((item) => location.pathname.startsWith(item.to));
  const profileName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || user?.email || 'User';
  const profileRole = String(user?.role || user?.user_role || 'user');

  useEffect(() => {
    if (isAdminSectionActive) {
      setAdminMenuOpen(true);
      setMobileAdminMenuOpen(true);
    }
  }, [isAdminSectionActive]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const orders = await orderService.list();
        const unassignedOrders = Array.isArray(orders) ? orders.filter((order) => order.status === 'APPROVED').length : 0;
        setCounts({ unassignedOrders });
      } catch {
        // Keep default badge values when badge APIs are unavailable.
      }
    };
    fetchCounts();
  }, []);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6'>
          <Link to='/dashboard' className='text-lg font-bold text-slate-900'>
            Logistics OMS
          </Link>

          <nav className='hidden items-center gap-1 lg:flex'>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                  {item.to === '/dashboard/assignments' && counts.unassignedOrders > 0 && (
                    <span className='rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white'>{counts.unassignedOrders}</span>
                  )}
                </NavLink>
              );
            })}
            {canAccessAdminSection && (
              <div className='relative'>
                <button
                  type='button'
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isAdminSectionActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setAdminMenuOpen((prev) => !prev)}
                >
                  <ShieldCheck size={16} />
                  Administration
                  <ChevronDown size={14} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {adminMenuOpen && (
                  <div className='absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg'>
                    {adminNavItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                        }
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className='relative hidden items-center gap-3 lg:flex'>
            <button
              type='button'
              className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700'
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              aria-label='Open profile menu'
            >
              {profileName.charAt(0).toUpperCase()}
            </button>
            {profileMenuOpen && (
              <div className='absolute right-0 top-12 z-40 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg'>
                <p className='text-sm font-semibold text-slate-800'>{profileName}</p>
                <p className='text-xs text-slate-500'>{user?.email || 'no-email'}</p>
                <p className='mt-1 text-xs uppercase tracking-wide text-slate-500'>Role: {profileRole}</p>
                <button
                  type='button'
                  className='mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white'
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type='button'
            className='inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden'
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className='border-t border-slate-200 bg-white px-4 py-3 lg:hidden sm:px-6'>
            <nav className='space-y-1'>
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {item.label}
                    {item.to === '/dashboard/assignments' && counts.unassignedOrders > 0 && (
                      <span className='rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white'>{counts.unassignedOrders}</span>
                    )}
                  </NavLink>
                );
              })}
              {canAccessAdminSection && (
                <div className='rounded-lg border border-slate-200'>
                  <button
                    type='button'
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${isAdminSectionActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                    onClick={() => setMobileAdminMenuOpen((prev) => !prev)}
                  >
                    <span className='inline-flex items-center gap-2'>
                      <ShieldCheck size={16} />
                      Administration
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${mobileAdminMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAdminMenuOpen && (
                    <div className='space-y-1 p-2 pt-0'>
                      {adminNavItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                          }
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
            <div className='mt-3 flex items-center justify-between border-t border-slate-200 pt-3'>
              <div>
                <p className='text-sm font-semibold text-slate-800'>{profileName}</p>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Role: {profileRole}</p>
              </div>
              <button type='button' className='inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white' onClick={onLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6'>
        {location.pathname === '/dashboard' && (
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-slate-800'>Logistics Dashboard</h1>
            <p className='text-sm text-slate-500'>Manage orders, assignments, fleet, pricing, and finance</p>
          </div>
        )}
        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
