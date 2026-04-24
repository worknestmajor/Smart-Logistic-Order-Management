import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { useToast } from '../components/base/BaseToast';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '../utils/error';
import type { User } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/orders');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(form);
      const tokenUser = authService.buildUserFromToken(response.access);
      let resolvedUser: User = { email: form.email, ...(tokenUser || {}) };
      try {
        const backendUser = await authService.getUserById(tokenUser?.id);
        if (backendUser) {
          resolvedUser = await authService.enrichUserRole(backendUser);
        }
      } catch {
        // Keep token-derived/fallback user when profile endpoint is unavailable.
      }

      setAuth({
        token: response.access,
        refreshToken: response.refresh,
        user: resolvedUser,
      });
      showToast('Login successful', 'success');
      navigate('/dashboard/orders');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Invalid credentials'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-bold text-slate-800'>Welcome Back</h2>
        <p className='text-sm text-slate-500'>Login to access logistics dashboard</p>
      </div>

      <BaseForm onSubmit={onSubmit}>
        <BaseInput label='Email' type='email' value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <BaseInput label='Password' type='password' value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        <BaseButton type='submit' className='w-full' disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </BaseButton>
      </BaseForm>
    </div>
  );
}
