import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Button, LoadingSpinner } from '../../components/UI';

export default function AttributeValueForm() {
  const { attrId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    value: '',
    display_order: 0,
  });
  const [attributeName, setAttributeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const promises = [];

    if (attrId) {
      promises.push(
        api.get(`/admin/attributes/${attrId}`).then(res => {
          setAttributeName(res.data?.name || 'Attribute');
        })
      );
    }

    if (isEdit) {
      promises.push(
        api.get(`/admin/attribute-values/${id}`).then(res => {
          const v = res.data;
          setForm({
            value: v.value || '',
            display_order: v.display_order ?? 0,
          });
          if (!attrId && v.attribute_type_name) {
            setAttributeName(v.attribute_type_name);
          }
        })
      );
    }

    if (!promises.length) {
      setLoading(false);
      return;
    }

    Promise.all(promises)
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id, attrId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      value: form.value,
      display_order: parseInt(form.display_order) || 0,
    };

    const request = isEdit
      ? api.patch(`/admin/attribute-values/${id}`, payload)
      : api.post(`/admin/attributes/${attrId}/values`, payload);

    request
      .then(res => {
        toast.success(res.message || `Value ${isEdit ? 'updated' : 'created'} successfully`);
        const backTo = attrId ? `/attributes/${attrId}/values` : '/attributes';
        navigate(backTo);
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} value`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  const backPath = attrId ? `/attributes/${attrId}/values` : '/attributes';

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Value' : 'Add Value'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Attributes', to: '/attributes' },
          ...(attrId ? [{ label: `${attributeName} Values`, to: `/attributes/${attrId}/values` }] : []),
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Value" name="value" value={form.value} onChange={handleChange} required />
          <Input label="Display Order" name="display_order" type="number" value={form.display_order} onChange={handleChange} />

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Value' : 'Create Value'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
