import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Input, Textarea, Button, LoadingSpinner } from '../../components/UI';

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    link_product_id: '',
    display_order: 0,
    is_active: true,
    authentic: false,
    start_date: '',
    end_date: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/banners/${id}`)
      .then(res => {
        const b = res.data;
        setForm({
          title: b.title || '',
          subtitle: b.subtitle || '',
          button_text: b.button_text || '',
          link_product_id: b.link_product_id || b.link_product || '',
          display_order: b.display_order ?? 0,
          is_active: b.is_active !== false,
          authentic: b.authentic || false,
          start_date: b.start_date ? b.start_date.split('T')[0] : '',
          end_date: b.end_date ? b.end_date.split('T')[0] : '',
        });
        if (b.image) setImagePreview(b.image);
        if (b.mobile_image) setMobileImagePreview(b.mobile_image);
      })
      .catch(() => toast.error('Failed to load banner'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'mobile') {
      setMobileImageFile(file);
      setMobileImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle);
    formData.append('button_text', form.button_text);
    formData.append('link_product_id', form.link_product_id);
    formData.append('display_order', form.display_order);
    formData.append('is_active', form.is_active);
    formData.append('authentic', form.authentic);
    if (form.start_date) formData.append('start_date', form.start_date);
    if (form.end_date) formData.append('end_date', form.end_date);
    if (imageFile) formData.append('image', imageFile);
    if (mobileImageFile) formData.append('mobile_image', mobileImageFile);

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const request = isEdit
      ? api.patch(`/admin/banners/${id}`, formData, config)
      : api.post('/admin/banners', formData, config);

    request
      .then(res => {
        toast.success(res.message || `Banner ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/banners');
      })
      .catch(err => toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} banner`))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Banner' : 'Add Banner'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Banners', to: '/banners' },
          { label: isEdit ? 'Edit' : 'Add' },
        ]}
      />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Textarea label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
          <Input label="Button Text" name="button_text" value={form.button_text} onChange={handleChange} />
          <Input label="Link Product ID" name="link_product_id" value={form.link_product_id} onChange={handleChange} placeholder="Product ID to link to" />
          <Input label="Display Order" name="display_order" type="number" value={form.display_order} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            <Input label="End Date" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="authentic" checked={form.authentic} onChange={handleChange} className="rounded border-gray-300" />
              <span className="text-sm text-gray-700">Authentic</span>
            </label>
          </div>

          {/* Desktop Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'desktop')} className="text-sm" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-full max-w-md h-32 object-cover rounded-lg border" />
            )}
          </div>

          {/* Mobile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Image</label>
            <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'mobile')} className="text-sm" />
            {mobileImagePreview && (
              <img src={mobileImagePreview} alt="Mobile Preview" className="mt-2 w-48 h-32 object-cover rounded-lg border" />
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/banners')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
