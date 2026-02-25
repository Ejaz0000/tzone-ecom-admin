import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, ConfirmModal, LoadingSpinner } from '../../components/UI';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  const fetchUsers = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/users${params}`)
      .then(res => setUsers(res.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleDelete = () => {
    const { user } = deleteModal;
    if (!user) return;
    api.delete(`/admin/users/${user.id}`)
      .then(res => {
        toast.success(res.message || 'User deleted successfully');
        setUsers(prev => prev.filter(u => u.id !== user.id));
      })
      .catch(err => toast.error(err.message || 'Failed to delete user'))
      .finally(() => setDeleteModal({ open: false, user: null }));
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', render: row => row.phone || '—' },
    {
      header: 'Staff',
      render: row => (
        <Badge variant={row.is_staff ? 'info' : 'default'}>
          {row.is_staff ? 'Staff' : 'Customer'}
        </Badge>
      ),
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
      header: 'Date Joined',
      render: row => row.date_joined ? new Date(row.date_joined).toLocaleDateString() : '—',
    },
    {
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <Link to={`/users/${row.id}/edit`}>
            <Button variant="ghost" size="sm"><HiPencil className="w-4 h-4" /></Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, user: row })}>
            <HiTrash className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage user accounts"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Users' }]}
        actions={
          <Link to="/users/add">
            <Button><HiPlus className="w-4 h-4" /> Add User</Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={users} emptyMessage="No users found" />}
      </Card>

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.user?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
