import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Select, Textarea, Button, LoadingSpinner } from '../../components/UI';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    brand_id: '',
    price: '',
    sale_price: '',
    stock: 0,
    low_stock_threshold: 5,
    weight: '',
    length: '',
    width: '',
    height: '',
    is_active: true,
    authentic: true,
    meta_title: '',
    meta_description: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const promises = [
      api.get('/admin/categories').then(res => setCategories(res.data || [])),
      api.get('/admin/brands').then(res => setBrands(res.data || [])),
    ];
    if (isEdit) {
      promises.push(
        api.get(`/admin/products/${id}`).then(res => {
          const p = res.data;
          setForm({
            title: p.title || '',
            slug: p.slug || '',
            description: p.description || '',
            category_id: p.category_id || p.category?.id || '',
            brand_id: p.brand_id || p.brand?.id || '',
            price: p.price ?? '',
            sale_price: p.sale_price ?? '',
            stock: p.stock ?? 0,
            low_stock_threshold: p.low_stock_threshold ?? 5,
            weight: p.weight ?? '',
            length: p.length ?? '',
            width: p.width ?? '',
            height: p.height ?? '',
            is_active: p.is_active !== false && p.is_active !== 0,
            authentic: p.authentic !== false && p.authentic !== 0,
            meta_title: p.meta_title || '',
            meta_description: p.meta_description || '',
          });
          if (p.images) setExistingImages(p.images);
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
      if (name === 'title' && (!prev.slug || prev.slug === slugify(prev.title))) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId) => {
    setDeleteImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('category_id', form.category_id);
    formData.append('brand_id', form.brand_id);
    formData.append('price', form.price);
    if (form.sale_price !== '') formData.append('sale_price', form.sale_price);
    formData.append('stock', form.stock);
    formData.append('low_stock_threshold', form.low_stock_threshold);
    if (form.weight !== '') formData.append('weight', form.weight);
    if (form.length !== '') formData.append('length', form.length);
    if (form.width !== '') formData.append('width', form.width);
    if (form.height !== '') formData.append('height', form.height);
    formData.append('is_active', form.is_active);
    formData.append('authentic', form.authentic);
    formData.append('meta_title', form.meta_title);
    formData.append('meta_description', form.meta_description);

    imageFiles.forEach(file => formData.append('images', file));
    deleteImageIds.forEach(imgId => formData.append('delete_images', imgId));

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const request = isEdit
      ? api.patch(`/admin/products/${id}`, formData, config)
      : api.post('/admin/products', formData, config);

    request
      .then(res => {
        toast.success(res.message || `Product ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/products');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} product`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Add Product'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Products', to: '/products' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-4xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
              <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />
            </div>
            <div className="mt-4">
              <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />
            </div>
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Category" name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Brand" name="brand_id" value={form.brand_id} onChange={handleChange}>
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Pricing & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
              <Input label="Sale Price" name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} />
              <Input label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} />
              <Input label="Low Stock Threshold" name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Dimensions & Weight</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Weight (g)" name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} />
              <Input label="Length (cm)" name="length" type="number" step="0.01" value={form.length} onChange={handleChange} />
              <Input label="Width (cm)" name="width" type="number" step="0.01" value={form.width} onChange={handleChange} />
              <Input label="Height (cm)" name="height" type="number" step="0.01" value={form.height} onChange={handleChange} />
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Images</h3>

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current Images</p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.image} alt={img.alt_text || 'Product'} className="w-24 h-24 rounded-lg object-cover border" />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {imageFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">New Images</p>
                <div className="flex flex-wrap gap-3">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-24 h-24 rounded-lg object-cover border" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* SEO */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">SEO</h3>
            <div className="space-y-4">
              <Input label="Meta Title" name="meta_title" value={form.meta_title} onChange={handleChange} />
              <Textarea label="Meta Description" name="meta_description" value={form.meta_description} onChange={handleChange} />
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="authentic" checked={form.authentic} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Authentic</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/products')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
