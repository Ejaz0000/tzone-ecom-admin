import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiViewList } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Button, SearchBar, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function AttributeList() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchAttributes = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/attributes${params}`)
      .then(res => setAttributes(res.data || []))
      .catch(() => toast.error('Failed to load attributes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttributes(); }, [search]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/attributes/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Attribute deleted successfully');
        setAttributes(prev => prev.filter(a => a.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete attribute'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    { header: 'Name', render: row => <span className="font-medium">{row.name}</span> },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Display Order', accessor: 'display_order' },
    { header: 'Values Count', render: row => row.values_count ?? row.values?.length ?? 0 },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-1">
          <Link to={`/attributes/${row.id}/edit`}>
            <Button variant="ghost" size="sm"><HiPencil className="w-4 h-4" /></Button>
          </Link>
          <Link to={`/attributes/${row.id}/values`}>
            <Button variant="ghost" size="sm" title="Values"><HiViewList className="w-4 h-4 text-purple-500" /></Button>
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
        title="Attributes"
        subtitle="Manage product attribute types"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Attributes' }]}
        actions={
          <Link to="/attributes/add">
            <Button><HiPlus className="w-4 h-4" /> Add Attribute</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search attributes..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={attributes} emptyMessage="No attributes found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? All associated values will also be removed. This action cannot be undone.`}
      />
    </div>
  );
}
