import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiCollection } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchProducts = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/products${params}`)
      .then(res => setProducts(res.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/products/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Product deleted successfully');
        setProducts(prev => prev.filter(p => p.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete product'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    {
      header: 'Image',
      render: row => row.primary_image ? (
        <img src={row.primary_image} alt={row.title} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
      ),
    },
    { header: 'Title', render: row => <span className="font-medium">{row.title}</span> },
    { header: 'Category', render: row => row.category?.name || '—' },
    { header: 'Brand', render: row => row.brand?.name || '—' },
    {
      header: 'Price',
      render: row => (
        <div>
          <span className={row.sale_price ? 'line-through text-gray-400 mr-1' : ''}>
            Rs {Number(row.price).toLocaleString()}
          </span>
          {row.sale_price && <span className="text-red-600 font-medium">Rs {Number(row.sale_price).toLocaleString()}</span>}
        </div>
      ),
    },
    { header: 'Stock', render: row => <span className={row.stock <= 5 ? 'text-red-600 font-medium' : ''}>{row.stock}</span> },
    {
      header: 'Active',
      render: row => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { header: 'Variants', render: row => row.variant_count ?? 0 },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-1">
          <Link to={`/products/${row.id}/edit`}>
            <Button variant="ghost" size="sm"><HiPencil className="w-4 h-4" /></Button>
          </Link>
          <Link to={`/products/${row.id}/variants`}>
            <Button variant="ghost" size="sm" title="Variants"><HiCollection className="w-4 h-4 text-purple-500" /></Button>
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
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Products' }]}
        actions={
          <Link to="/products/add">
            <Button><HiPlus className="w-4 h-4" /> Add Product</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={products} emptyMessage="No products found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.item?.title}"? All variants and images will also be removed. This action cannot be undone.`}
      />
    </div>
  );
}
