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
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';

function App() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

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
      if (!token || user?.id) return;
      const tokenUser = authService.buildUserFromToken(token);
      if (!tokenUser) return;
      setUser(tokenUser);
      try {
        const backendUser = await authService.getUserById(tokenUser.id);
        if (backendUser) {
          setUser(await authService.enrichUserRole(backendUser));
        }
      } catch {
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
        </Route>
      </Route>

      <Route path='/' element={<Navigate to='/dashboard/orders' replace />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
