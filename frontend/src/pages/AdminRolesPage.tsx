import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BaseButton } from '../components/base/BaseButton';
import { BaseForm } from '../components/base/BaseForm';
import { BaseInput } from '../components/base/BaseInput';
import { BaseLoader } from '../components/base/BaseLoader';
import { BaseModal } from '../components/base/BaseModal';
import { BaseTable } from '../components/base/BaseTable';
import { useToast } from '../components/base/BaseToast';
import { adminService } from '../services/adminService';
import { getApiErrorMessage } from '../utils/error';
import type { Role } from '../types';

export function AdminRolesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      setRoles(await adminService.listRoles());
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load roles'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const createRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await adminService.createRole(form);
      showToast('Role created', 'success');
      setForm({ name: '', code: '', description: '' });
      fetchRoles();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to create role'), 'error');
    }
  };

  const updateRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.id) return;
    try {
      await adminService.updateRole(editing.id, {
        name: editing.name,
        code: editing.code,
        description: editing.description,
      });
      showToast('Role updated', 'success');
      setEditing(null);
      fetchRoles();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to update role'), 'error');
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold text-slate-800'>Administration / Roles</h2>
        <p className='text-sm text-slate-500'>Create and update role definitions.</p>
      </div>

      <div className='rounded-xl border bg-white p-4'>
        <h3 className='mb-3 text-sm font-semibold text-slate-700'>Create Role</h3>
        <BaseForm onSubmit={createRole} className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <BaseInput label='Role Name' value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <BaseInput label='Role Code' value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} required />
          <BaseInput label='Description' value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <div className='self-end'>
            <BaseButton type='submit'>Add Role</BaseButton>
          </div>
        </BaseForm>
      </div>

      {loading ? (
        <BaseLoader />
      ) : (
        <BaseTable
          columns={[
            { key: 'name', title: 'Role Name' },
            { key: 'code', title: 'Code' },
            { key: 'description', title: 'Description' },
            {
              key: 'action',
              title: 'Action',
              render: (_: unknown, row: Role) => (
                <BaseButton variant='secondary' onClick={() => setEditing(row)}>
                  Edit
                </BaseButton>
              ),
            },
          ]}
          data={roles}
        />
      )}

      <BaseModal open={!!editing} title='Update Role' onClose={() => setEditing(null)}>
        {editing && (
          <BaseForm onSubmit={updateRole} className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <BaseInput label='Role Name' value={editing.name || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))} required />
            <BaseInput label='Role Code' value={editing.code || ''} onChange={(e) => setEditing((prev) => (prev ? { ...prev, code: e.target.value } : prev))} required />
            <BaseInput
              label='Description'
              value={editing.description || ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
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
