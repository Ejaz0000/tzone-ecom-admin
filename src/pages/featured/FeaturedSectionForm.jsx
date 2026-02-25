import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Select, Textarea, Button, LoadingSpinner } from '../../components/UI';

export default function FeaturedSectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    section_type: 'custom',
    max_products: 10,
    display_order: 0,
    is_active: true,
  });
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const promises = [
      api.get('/admin/products').then(res => setProducts(res.data || [])),
    ];

    if (isEdit) {
      promises.push(
        api.get(`/admin/featured-sections/${id}`).then(res => {
          const s = res.data;
          setForm({
            title: s.title || '',
            subtitle: s.subtitle || '',
            section_type: s.section_type || 'custom',
            max_products: s.max_products ?? 10,
            display_order: s.display_order ?? 0,
            is_active: s.is_active !== false,
          });
          setSelectedProductIds(
            (s.products || s.product_ids || []).map(p => typeof p === 'object' ? p.id : p)
          );
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

  const toggleProduct = (productId) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      max_products: parseInt(form.max_products) || 10,
      display_order: parseInt(form.display_order) || 0,
      product_ids: selectedProductIds,
    };

    const request = isEdit
      ? api.patch(`/admin/featured-sections/${id}`, payload)
      : api.post('/admin/featured-sections', payload);

    request
      .then(res => {
        toast.success(res.message || `Section ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/featured-sections');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} section`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  const filteredProducts = products.filter(p =>
    !productSearch || p.title?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Featured Section' : 'Add Featured Section'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Featured Sections', to: '/featured-sections' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Textarea label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />

          <Select
            label="Section Type"
            name="section_type"
            value={form.section_type}
            onChange={handleChange}
          >
            <option value="custom">Custom</option>
            <option value="new_arrivals">New Arrivals</option>
            <option value="best_sellers">Best Sellers</option>
            <option value="on_sale">On Sale</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Products" name="max_products" type="number" value={form.max_products} onChange={handleChange} />
            <Input label="Display Order" name="display_order" type="number" value={form.display_order} onChange={handleChange} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Products ({selectedProductIds.length} selected)
            </label>
            <input
              type="text"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Filter products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 text-center">No products found</p>
              ) : (
                filteredProducts.map(product => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="rounded border-gray-300"
                    />
                    {product.primary_image && (
                      <img src={product.primary_image} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <span className="text-sm text-gray-700">{product.title}</span>
                    <span className="text-xs text-gray-400 ml-auto">Rs {Number(product.price).toLocaleString()}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/featured-sections')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
