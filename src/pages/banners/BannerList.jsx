import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, Toggle, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchBanners = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/banners${params}`)
      .then(res => setBanners(res.data || []))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, [search]);

  const handleToggleStatus = (banner) => {
    api.post(`/admin/banners/${banner.id}/toggle-status`)
      .then(res => {
        toast.success(res.message || 'Status updated');
        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
      })
      .catch(err => toast.error(err.message || 'Failed to toggle status'));
  };

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/banners/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Banner deleted successfully');
        setBanners(prev => prev.filter(b => b.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete banner'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    {
      header: 'Image',
      render: row => row.image ? (
        <img src={row.image} alt={row.title} className="w-20 h-10 rounded object-cover" />
      ) : (
        <div className="w-20 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
      ),
    },
    { header: 'Title', render: row => <span className="font-medium">{row.title}</span> },
    { header: 'Subtitle', render: row => <span className="text-gray-500 truncate max-w-[200px] block">{row.subtitle || '—'}</span> },
    {
      header: 'Type',
      render: row => (
        <Badge variant={row.authentic ? 'success' : 'info'}>
          {row.authentic ? 'Authentic' : 'Replica'}
        </Badge>
      ),
    },
    { header: 'Order', accessor: 'display_order' },
    {
      header: 'Active',
      render: row => (
        <Toggle
          checked={row.is_active}
          onChange={() => handleToggleStatus(row)}
        />
      ),
    },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-1">
          <Link to={`/banners/${row.id}/edit`}>
            <Button variant="ghost" size="sm"><HiPencil className="w-4 h-4" /></Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, item: row })}>
            <HiTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="Manage homepage banners"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Banners' }]}
        actions={
          <Link to="/banners/add">
            <Button><HiPlus className="w-4 h-4" /> Add Banner</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search banners..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={banners} emptyMessage="No banners found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteModal.item?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
