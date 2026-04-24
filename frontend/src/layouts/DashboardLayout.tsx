import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, UserRound, Route, ReceiptText, Bell, BadgeDollarSign, ShieldCheck, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../modules/orders/services/orderService';
import { notificationService } from '../services/notificationService';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/assignments', label: 'Assignments', icon: Route },
  { to: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/dashboard/drivers', label: 'Drivers', icon: UserRound },
  { to: '/dashboard/pricing', label: 'Pricing', icon: BadgeDollarSign },
  { to: '/dashboard/invoices', label: 'Invoices', icon: ReceiptText },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ unassignedOrders: 0, unreadNotifications: 0 });

  const isAdminUser = useMemo(() => {
    const roleValue = user?.role || user?.user_role || '';
    const rolesValue = user?.roles;
    const normalizedRole = String(roleValue).toLowerCase();

    if (Array.isArray(rolesValue)) {
      return rolesValue.map((role) => String(role).toLowerCase()).some((role) => role.includes('admin'));
    }
    return normalizedRole.includes('admin');
  }, [user]);

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdminUser);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ordersRes, notifications] = await Promise.all([orderService.list(), notificationService.list()]);
        const orders = ordersRes?.data?.results || ordersRes?.data || [];
        const unassignedOrders = Array.isArray(orders) ? orders.filter((order) => order.status === 'APPROVED').length : 0;
        const unreadNotifications = Array.isArray(notifications) ? notifications.filter((item) => !item.is_read).length : 0;
        setCounts({ unassignedOrders, unreadNotifications });
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
                  {item.to === '/dashboard/notifications' && counts.unreadNotifications > 0 && (
                    <span className='rounded-full bg-red-500 px-2 py-0.5 text-xs text-white'>{counts.unreadNotifications}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className='hidden items-center gap-3 lg:flex'>
            <span className='text-sm text-slate-600'>{user?.email || 'User'}</span>
            <button type='button' className='inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white' onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </button>
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
                    {item.to === '/dashboard/notifications' && counts.unreadNotifications > 0 && (
                      <span className='rounded-full bg-red-500 px-2 py-0.5 text-xs text-white'>{counts.unreadNotifications}</span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
            <div className='mt-3 flex items-center justify-between border-t border-slate-200 pt-3'>
              <span className='text-sm text-slate-600'>{user?.email || 'User'}</span>
              <button type='button' className='inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white' onClick={onLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-slate-800'>Logistics Dashboard</h1>
          <p className='text-sm text-slate-500'>Manage orders, assignments, fleet, pricing, and finance</p>
        </div>
        <section>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
