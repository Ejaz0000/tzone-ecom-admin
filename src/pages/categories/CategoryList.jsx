import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchCategories = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/categories${params}`)
      .then(res => setCategories(res.data || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, [search]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/categories/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Category deleted successfully');
        setCategories(prev => prev.filter(c => c.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete category'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    {
      header: 'Image',
      render: row => row.image ? (
        <img src={row.image} alt={row.name} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
      ),
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Parent', render: row => row.parent_name || '—' },
    { header: 'Products', render: row => row.products_count ?? 0 },
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
          <Link to={`/categories/${row.id}/edit`}>
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
        title="Categories"
        subtitle="Manage product categories"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Categories' }]}
        actions={
          <Link to="/categories/add">
            <Button><HiPlus className="w-4 h-4" /> Add Category</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={categories} emptyMessage="No categories found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
