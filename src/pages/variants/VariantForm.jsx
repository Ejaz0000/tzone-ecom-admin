import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Select, Button, LoadingSpinner } from '../../components/UI';

export default function VariantForm() {
  const { productId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    sku: '',
    price: '',
    sale_price: '',
    stock: 0,
    weight: '',
    is_active: true,
  });
  const [attributes, setAttributes] = useState({});
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const promises = [
      api.get('/admin/attributes').then(res => {
        const types = res.data || [];
        setAttributeTypes(types);
        return Promise.all(
          types.map(t =>
            api.get(`/admin/attributes/${t.id}/values`).then(vRes => ({
              typeId: t.id,
              values: vRes.data?.values || vRes.data || [],
            }))
          )
        ).then(results => {
          const valMap = {};
          results.forEach(r => { valMap[r.typeId] = r.values; });
          setAttributeValues(valMap);
        });
      }),
    ];

    if (isEdit) {
      promises.push(
        api.get(`/admin/variants/${id}`).then(res => {
          const v = res.data;
          setForm({
            sku: v.sku || '',
            price: v.price || '',
            sale_price: v.sale_price || '',
            stock: v.stock ?? 0,
            weight: v.weight || '',
            is_active: v.is_active !== false,
          });
          const attrs = {};
          (v.attributes || v.attribute_values || []).forEach(a => {
            attrs[a.attribute_type_id || a.attribute_type] = a.attribute_value_id || a.id;
          });
          setAttributes(attrs);
        })
      );
    }

    Promise.all(promises)
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAttributeChange = (typeId, valueId) => {
    setAttributes(prev => ({ ...prev, [typeId]: valueId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock) || 0,
      weight: form.weight ? parseFloat(form.weight) : null,
      attributes,
    };

    const request = isEdit
      ? api.patch(`/admin/variants/${id}`, payload)
      : api.post(`/admin/products/${productId}/variants`, payload);

    request
      .then(res => {
        toast.success(res.message || `Variant ${isEdit ? 'updated' : 'created'} successfully`);
        const backTo = isEdit ? `/products/${res.data?.product_id || productId}/variants` : `/products/${productId}/variants`;
        navigate(backTo);
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} variant`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  const backPath = isEdit ? -1 : `/products/${productId}/variants`;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Variant' : 'Add Variant'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Products', to: '/products' },
          { label: 'Variants', to: productId ? `/products/${productId}/variants` : '/products' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
            <Input label="Sale Price" name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
            <Input label="Weight" name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          {attributeTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Attributes</h3>
              <div className="space-y-3">
                {attributeTypes.map(type => (
                  <Select
                    key={type.id}
                    label={type.name}
                    value={attributes[type.id] || ''}
                    onChange={e => handleAttributeChange(type.id, e.target.value)}
                  >
                    <option value="">Select {type.name}</option>
                    {(attributeValues[type.id] || []).map(val => (
                      <option key={val.id} value={val.id}>{val.value}</option>
                    ))}
                  </Select>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Variant' : 'Create Variant'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
