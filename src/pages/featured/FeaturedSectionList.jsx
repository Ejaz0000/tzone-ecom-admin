import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, Toggle, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function FeaturedSectionList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchSections = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/featured-sections${params}`)
      .then(res => setSections(res.data || []))
      .catch(() => toast.error('Failed to load featured sections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSections(); }, [search]);

  const handleToggleStatus = (section) => {
    api.post(`/admin/featured-sections/${section.id}/toggle-status`)
      .then(res => {
        toast.success(res.message || 'Status updated');
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: !s.is_active } : s));
      })
      .catch(err => toast.error(err.message || 'Failed to toggle status'));
  };

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/featured-sections/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Section deleted successfully');
        setSections(prev => prev.filter(s => s.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete section'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const sectionTypeVariant = (type) => {
    const map = { custom: 'default', new_arrivals: 'info', best_sellers: 'success', on_sale: 'warning' };
    return map[type] || 'default';
  };

  const columns = [
    { header: 'Title', render: row => <span className="font-medium">{row.title}</span> },
    {
      header: 'Type',
      render: row => (
        <Badge variant={sectionTypeVariant(row.section_type)}>
          {(row.section_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      ),
    },
    { header: 'Products', render: row => row.products_count ?? row.products?.length ?? 0 },
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
          <Link to={`/featured-sections/${row.id}/edit`}>
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
        title="Featured Sections"
        subtitle="Manage homepage featured sections"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Featured Sections' }]}
        actions={
          <Link to="/featured-sections/add">
            <Button><HiPlus className="w-4 h-4" /> Add Section</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search sections..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={sections} emptyMessage="No featured sections found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Section"
        message={`Are you sure you want to delete "${deleteModal.item?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
