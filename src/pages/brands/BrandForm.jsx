import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Textarea, Button, LoadingSpinner } from '../../components/UI';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/brands/${id}`)
        .then(res => {
          const b = res.data;
          setForm({
            name: b.name || '',
            slug: b.slug || '',
            description: b.description || '',
            website: b.website || '',
            is_active: b.is_active !== false && b.is_active !== 0,
          });
          if (b.logo) setLogoPreview(b.logo);
        })
        .catch(() => toast.error('Failed to load brand'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && (!prev.slug || prev.slug === slugify(prev.name))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('website', form.website);
    formData.append('is_active', form.is_active);
    if (logoFile) formData.append('logo', logoFile);

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const request = isEdit
      ? api.patch(`/admin/brands/${id}`, formData, config)
      : api.post('/admin/brands', formData, config);

    request
      .then(res => {
        toast.success(res.message || `Brand ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/brands');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} brand`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Brand' : 'Add Brand'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Brands', to: '/brands' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />

          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            {logoPreview && (
              <img src={logoPreview} alt="Preview" className="w-24 h-24 rounded object-contain bg-gray-50 mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          <Input label="Website" name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://..." />

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Update Brand' : 'Create Brand')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/brands')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
