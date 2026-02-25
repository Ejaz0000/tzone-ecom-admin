import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Button, LoadingSpinner } from '../../components/UI';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AttributeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/attributes/${id}`)
      .then(res => {
        const a = res.data;
        setForm({
          name: a.name || '',
          slug: a.slug || '',
          display_order: a.display_order ?? 0,
        });
      })
      .catch(() => toast.error('Failed to load attribute'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && (!prev.slug || prev.slug === slugify(prev.name))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      display_order: parseInt(form.display_order) || 0,
    };

    const request = isEdit
      ? api.patch(`/admin/attributes/${id}`, payload)
      : api.post('/admin/attributes', payload);

    request
      .then(res => {
        toast.success(res.message || `Attribute ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/attributes');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} attribute`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Attribute' : 'Add Attribute'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Attributes', to: '/attributes' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />
          <Input label="Display Order" name="display_order" type="number" value={form.display_order} onChange={handleChange} />

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Attribute' : 'Create Attribute'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/attributes')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
