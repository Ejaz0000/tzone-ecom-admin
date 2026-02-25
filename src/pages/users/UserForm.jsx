import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Button, LoadingSpinner } from '../../components/UI';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    is_staff: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/users/${id}`)
        .then(res => {
          const u = res.data;
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            password: '',
            is_staff: u.is_staff || false,
            is_active: u.is_active !== false,
          });
        })
        .catch(() => toast.error('Failed to load user'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      is_staff: form.is_staff,
      is_active: form.is_active,
    };

    if (isEdit) {
      if (form.password) payload.new_password = form.password;
    } else {
      if (!form.password) {
        toast.error('Password is required');
        setSubmitting(false);
        return;
      }
      payload.password = form.password;
    }

    const request = isEdit
      ? api.patch(`/admin/users/${id}`, payload)
      : api.post('/admin/users', payload);

    request
      .then(res => {
        toast.success(res.message || `User ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/users');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} user`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit User' : 'Add User'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Users', to: '/users' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input
            label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_staff" checked={form.is_staff} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Staff Member</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/users')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
