import { Navigate } from 'react-router-dom';

export function AdminPage() {
  return <Navigate to='/dashboard/admin/users' replace />;
}
