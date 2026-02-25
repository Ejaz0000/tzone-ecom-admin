import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Select, Textarea, Button, LoadingSpinner } from '../../components/UI';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_active: true,
    display_order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const promises = [
      api.get('/admin/categories').then(res => setCategories(res.data || [])),
    ];
    if (isEdit) {
      promises.push(
        api.get(`/admin/categories/${id}`).then(res => {
          const c = res.data;
          setForm({
            name: c.name || '',
            slug: c.slug || '',
            description: c.description || '',
            parent_id: c.parent_id || '',
            is_active: c.is_active !== false && c.is_active !== 0,
            display_order: c.display_order || 0,
          });
          if (c.image) setImagePreview(c.image);
        })
      );
    }
    Promise.all(promises)
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('parent_id', form.parent_id);
    formData.append('is_active', form.is_active);
    formData.append('display_order', form.display_order);
    if (imageFile) formData.append('image', imageFile);

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const request = isEdit
      ? api.patch(`/admin/categories/${id}`, formData, config)
      : api.post('/admin/categories', formData, config);

    request
      .then(res => {
        toast.success(res.message || `Category ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/categories');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} category`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  const parentOptions = categories
    .filter(c => !isEdit || c.id !== parseInt(id))
    .map(c => ({ value: c.id, label: c.name }));

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Category' : 'Add Category'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Categories', to: '/categories' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />

          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />

          <Select label="Parent Category" name="parent_id" value={form.parent_id} onChange={handleChange}>
            <option value="">None (Top Level)</option>
            {parentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded object-cover mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          <Input label="Display Order" name="display_order" type="number" value={form.display_order} onChange={handleChange} />

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/categories')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
