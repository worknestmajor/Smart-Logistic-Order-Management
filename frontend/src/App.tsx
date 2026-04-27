import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PrivateRoute } from './components/common/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './modules/orders/pages/OrdersPage';
import { VehiclesPage } from './modules/vehicles/pages/VehiclesPage';
import { DriversPage } from './modules/drivers/pages/DriversPage';
import { AssignmentsPage } from './modules/assignments/pages/AssignmentsPage';
import { InvoicesPage } from './modules/invoices/pages/InvoicesPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { PricingPage } from './pages/PricingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';

function App() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const debugAuth = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[AUTH DEBUG]', ...args);
    }
  };

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [logout, navigate]);

  useEffect(() => {
    const bootstrapUser = async () => {
      if (!token) return;
      const currentRole = String(user?.role || user?.user_role || '').toLowerCase();
      const hasResolvedRole = currentRole.includes('admin') || currentRole.includes('manager');
      debugAuth('bootstrapUser start', { tokenExists: !!token, user, hasResolvedRole });
      if (user?.id && hasResolvedRole) return;
      const tokenUser = authService.buildUserFromToken(token);
      if (!tokenUser) return;
      setUser(tokenUser);
      try {
        const backendUser = await authService.getUserById(tokenUser.id);
        if (backendUser) {
          const resolvedUser = await authService.enrichUserRole(backendUser);
          debugAuth('bootstrapUser resolved user', resolvedUser);
          setUser(resolvedUser);
        }
      } catch {
        debugAuth('bootstrapUser failed to fetch/enrich backend user');
        // Keep token user when endpoint or permissions are unavailable.
      }
    };
    bootstrapUser();
  }, [token, user?.id, setUser]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path='/login' element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<DashboardHomePage />} />
          <Route path='/dashboard/orders' element={<OrdersPage />} />
          <Route path='/dashboard/vehicles' element={<VehiclesPage />} />
          <Route path='/dashboard/drivers' element={<DriversPage />} />
          <Route path='/dashboard/assignments' element={<AssignmentsPage />} />
          <Route path='/dashboard/pricing' element={<PricingPage />} />
          <Route path='/dashboard/invoices' element={<InvoicesPage />} />
          <Route path='/dashboard/notifications' element={<NotificationsPage />} />
          <Route path='/dashboard/admin' element={<AdminPage />} />
          <Route path='/dashboard/admin/users' element={<AdminUsersPage />} />
          <Route path='/dashboard/admin/roles' element={<AdminRolesPage />} />
        </Route>
      </Route>

      <Route path='/' element={<Navigate to='/dashboard/orders' replace />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
