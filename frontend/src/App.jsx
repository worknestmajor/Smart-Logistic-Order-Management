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
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';

function App() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [logout, navigate]);

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
          <Route path='/dashboard/invoices' element={<InvoicesPage />} />
        </Route>
      </Route>

      <Route path='/' element={<Navigate to='/dashboard/orders' replace />} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
