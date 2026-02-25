import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function BrandList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchBrands = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/brands${params}`)
      .then(res => setBrands(res.data || []))
      .catch(() => toast.error('Failed to load brands'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, [search]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/brands/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Brand deleted successfully');
        setBrands(prev => prev.filter(b => b.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete brand'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    {
      header: 'Logo',
      render: row => row.logo ? (
        <img src={row.logo} alt={row.name} className="w-10 h-10 rounded object-contain bg-gray-50" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
      ),
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Products', render: row => row.products_count ?? 0 },
    {
      header: 'Website',
      render: row => row.website ? (
        <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[200px] block">
          {row.website}
        </a>
      ) : '—',
    },
    {
      header: 'Active',
      render: row => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <Link to={`/brands/${row.id}/edit`}>
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
        title="Brands"
        subtitle="Manage product brands"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Brands' }]}
        actions={
          <Link to="/brands/add">
            <Button><HiPlus className="w-4 h-4" /> Add Brand</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search brands..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={brands} emptyMessage="No brands found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
