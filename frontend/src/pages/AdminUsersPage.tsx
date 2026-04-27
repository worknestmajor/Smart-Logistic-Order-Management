import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseModal } from '../components/base/BaseModal';
import { BaseSelect } from '../components/base/BaseSelect';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { adminService } from '../services/adminService';
import { getApiErrorMessage } from '../utils/error';
import type { Role, User } from '../types';

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([adminService.listUsers(), adminService.listRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load users'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetCreateForm = () => {
    setForm({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      role: '',
    });
  };

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await adminService.createUser(form);
      showToast('User created', 'success');
      resetCreateForm();
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create user'), 'error');
    }
  };

  const updateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.id) return;
    try {
      const payload = {
        email: editing.email || '',
        username: editing.username || '',
        first_name: editing.first_name || '',
        last_name: editing.last_name || '',
        phone: editing.phone || '',
        role: editing.role || '',
      } as Partial<User> & { password?: string };
      await adminService.updateUser(editing.id, payload);
      showToast('User updated', 'success');
      setEditing(null);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to update user'), 'error');
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold text-slate-800'>Administration / Users</h2>
        <p className='text-sm text-slate-500'>Create and update system users.</p>
      </div>

      <div className='rounded-xl border bg-white p-4'>
        <h3 className='mb-3 text-sm font-semibold text-slate-700'>Create User</h3>
        <BaseForm onSubmit={createUser} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseInput label='Email' type='email' value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
          <BaseInput label='Username' value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
          <BaseInput label='First Name' value={form.first_name} onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))} required />
          <BaseInput label='Last Name' value={form.last_name} onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))} />
          <BaseInput label='Phone' value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          <BaseInput label='Password' type='password' value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          <BaseSelect
            label='Role'
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            options={[{ value: '', label: 'Select Role' }, ...roles.map((role) => ({ value: role.id, label: role.name }))]}
            required
          />
          <div className='self-end'>
            <BaseButton type='submit'>Add User</BaseButton>
          </div>
        </BaseForm>
      </div>

      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            { key: 'email', title: 'Email' },
            { key: 'username', title: 'Username' },
            { key: 'first_name', title: 'First Name' },
            { key: 'last_name', title: 'Last Name' },
            { key: 'phone', title: 'Phone' },
            { key: 'role', title: 'Role' },
            {
              key: 'action',
              title: 'Action',
              render: (_: unknown, row: User) => (
                <BaseButton variant='secondary' onClick={() => setEditing(row)}>
                  Edit
                </BaseButton>
              ),
            },
          ]}
          data={users}
        />
      )}

      <BaseModal open={!!editing} title='Update User' onClose={() => setEditing(null)}>
        {editing && (
          <BaseForm onSubmit={updateUser} className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <BaseInput label='Email' type='email' value={editing.email || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, email: e.target.value } : prev))} required />
            <BaseInput label='Username' value={editing.username || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, username: e.target.value } : prev))} required />
            <BaseInput label='First Name' value={editing.first_name || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, first_name: e.target.value } : prev))} required />
            <BaseInput label='Last Name' value={editing.last_name || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, last_name: e.target.value } : prev))} />
            <BaseInput label='Phone' value={editing.phone || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, phone: e.target.value } : prev))} />
            <BaseSelect
              label='Role'
              value={editing.role || ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, role: e.target.value } : prev))}
              options={[{ value: '', label: 'Select Role' }, ...roles.map((role) => ({ value: role.id, label: role.name }))]}
              required
            />
            <div className='md:col-span-2'>
              <BaseButton type='submit'>Save Changes</BaseButton>
            </div>
          </BaseForm>
        )}
      </BaseModal>
    </div>
  );
}
