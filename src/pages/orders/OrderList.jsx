import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Table, Badge, Button, Select, SearchBar, LoadingSpinner } from '../../components/UI';

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  shipped: 'purple',
  delivered: 'success',
  cancelled: 'danger',
};

const PAYMENT_COLORS = {
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info',
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString() ? `?${params.toString()}` : '';
    api.get(`/admin/orders${qs}`)
      .then(res => setOrders(res.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [search, statusFilter]);

  const columns = [
    { header: 'Order #', render: row => <span className="font-medium">{row.order_number}</span> },
    {
      header: 'Customer',
      render: row => row.customer_name || row.customer?.name || row.customer?.email || row.email || '—',
    },
    {
      header: 'Status',
      render: row => (
        <Badge variant={STATUS_COLORS[row.status] || 'default'}>
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Payment',
      render: row => (
        <Badge variant={PAYMENT_COLORS[row.payment_status] || 'default'}>
          {row.payment_status?.charAt(0).toUpperCase() + row.payment_status?.slice(1)}
        </Badge>
      ),
    },
    { header: 'Items', render: row => row.items_count ?? row.items?.length ?? 0 },
    { header: 'Total', render: row => `Rs ${Number(row.total_price || row.total || 0).toLocaleString()}` },
    {
      header: 'Date',
      render: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
    },
    {
      header: 'Actions',
      render: row => (
        <Link to={`/orders/${row.id}`}>
          <Button variant="ghost" size="sm"><HiEye className="w-4 h-4" /> View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Manage customer orders"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Orders' }]}
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {loading ? <LoadingSpinner /> : <Table columns={columns} data={orders} emptyMessage="No orders found" />}
      </Card>
    </div>
  );
}
