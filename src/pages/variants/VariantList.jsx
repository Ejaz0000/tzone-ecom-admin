import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function VariantList() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchVariants = () => {
    setLoading(true);
    api.get(`/admin/products/${productId}/variants`)
      .then(res => {
        setProduct(res.data?.product || { id: productId, title: 'Product' });
        setVariants(res.data?.variants || []);
      })
      .catch(() => toast.error('Failed to load variants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVariants(); }, [productId]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/variants/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Variant deleted successfully');
        setVariants(prev => prev.filter(v => v.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete variant'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    { header: 'SKU', render: row => <span className="font-medium">{row.sku}</span> },
    { header: 'Price', render: row => `Rs ${Number(row.price).toLocaleString()}` },
    {
      header: 'Sale Price',
      render: row => row.sale_price ? `Rs ${Number(row.sale_price).toLocaleString()}` : '—',
    },
    {
      header: 'Stock',
      render: row => <span className={row.stock <= 5 ? 'text-red-600 font-medium' : ''}>{row.stock}</span>,
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
      header: 'Attributes',
      render: row => {
        const attrs = row.attributes || row.attribute_values || [];
        if (!attrs.length) return '—';
        return (
          <div className="flex flex-wrap gap-1">
            {attrs.map((attr, i) => (
              <Badge key={i} variant="info">
                {attr.attribute_type_name || attr.type}: {attr.value}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-1">
          <Link to={`/variants/${row.id}/edit`}>
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
        title={`${product?.title || 'Product'} Variants`}
        subtitle="Manage product variants"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Products', to: '/products' },
          { label: `${product?.title || 'Product'} Variants` },
        ]}
        actions={
          <Link to={`/products/${productId}/variants/add`}>
            <Button><HiPlus className="w-4 h-4" /> Add Variant</Button>
          </Link>
        }
      />

      <Card className="p-4">
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={variants} emptyMessage="No variants found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Variant"
        message={`Are you sure you want to delete variant "${deleteModal.item?.sku}"? This action cannot be undone.`}
      />
    </div>
  );
}
