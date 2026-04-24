import { useEffect, useState } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseSelect } from '../components/base/BaseSelect';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { adminService } from '../services/adminService';
import { getApiErrorMessage } from '../utils/error';
import type { Role, User } from '../types';

export function AdminPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
      showToast(getApiErrorMessage(err, 'Failed to load admin data'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await adminService.createUser(form);
      showToast('User created', 'success');
      setForm({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        role: '',
      });
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create user'), 'error');
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold text-slate-800'>Admin and Access</h2>
        <p className='text-sm text-slate-500'>Manage users and roles for operations and finance teams.</p>
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
        <>
          <BaseTable
            columns={[
              { key: 'email', title: 'Email' },
              { key: 'username', title: 'Username' },
              { key: 'first_name', title: 'First Name' },
              { key: 'last_name', title: 'Last Name' },
              { key: 'phone', title: 'Phone' },
            ]}
            data={users}
          />
          <BaseTable
            columns={[
              { key: 'name', title: 'Role Name' },
              { key: 'code', title: 'Code' },
              { key: 'description', title: 'Description' },
            ]}
            data={roles}
          />
        </>
      )}
    </div>
  );
}
