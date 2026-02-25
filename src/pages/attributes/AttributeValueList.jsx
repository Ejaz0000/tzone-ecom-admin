import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Button, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function AttributeValueList() {
  const { attrId } = useParams();
  const [attribute, setAttribute] = useState(null);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchValues = () => {
    setLoading(true);
    api.get(`/admin/attributes/${attrId}/values`)
      .then(res => {
        setAttribute(res.data?.attribute || { id: attrId, name: 'Attribute' });
        setValues(res.data?.values || []);
      })
      .catch(() => toast.error('Failed to load attribute values'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchValues(); }, [attrId]);

  const handleDelete = () => {
    const { item } = deleteModal;
    if (!item) return;
    api.delete(`/admin/attribute-values/${item.id}`)
      .then(res => {
        toast.success(res.message || 'Value deleted successfully');
        setValues(prev => prev.filter(v => v.id !== item.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete value'))
      .finally(() => setDeleteModal({ open: false, item: null }));
  };

  const columns = [
    { header: 'Value', render: row => <span className="font-medium">{row.value}</span> },
    { header: 'Display Order', accessor: 'display_order' },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-1">
          <Link to={`/attribute-values/${row.id}/edit`}>
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
        title={`${attribute?.name || 'Attribute'} Values`}
        subtitle="Manage attribute values"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Attributes', to: '/attributes' },
          { label: `${attribute?.name || 'Attribute'} Values` },
        ]}
        actions={
          <Link to={`/attributes/${attrId}/values/add`}>
            <Button><HiPlus className="w-4 h-4" /> Add Value</Button>
          </Link>
        }
      />

      <Card className="p-4">
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={values} emptyMessage="No values found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Value"
        message={`Are you sure you want to delete "${deleteModal.item?.value}"? This action cannot be undone.`}
      />
    </div>
  );
}
