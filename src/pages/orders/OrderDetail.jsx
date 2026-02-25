import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { PageHeader, Card, Badge, Button, Textarea, LoadingSpinner } from '../../components/UI';

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

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusChoices, setStatusChoices] = useState([]);
  const [paymentStatusChoices, setPaymentStatusChoices] = useState([]);
  const [statusForm, setStatusForm] = useState({ status: '', payment_status: '', notes: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then(res => {
        const data = res.data;
        setOrder(data);
        setStatusForm({
          status: data.status || '',
          payment_status: data.payment_status || '',
          notes: data.notes || '',
        });
        setStatusChoices(data.status_choices || [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ]);
        setPaymentStatusChoices(data.payment_status_choices || [
          { value: 'unpaid', label: 'Unpaid' },
          { value: 'paid', label: 'Paid' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ]);
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    setUpdating(true);
    api.patch(`/admin/orders/${id}/status`, statusForm)
      .then(res => {
        toast.success(res.message || 'Order updated successfully');
        setOrder(prev => ({ ...prev, ...statusForm }));
      })
      .catch(err => toast.error(err.message || 'Failed to update order'))
      .finally(() => setUpdating(false));
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-12 text-gray-500">Order not found</div>;

  const items = order.items || order.order_items || [];
  const billing = order.billing_address || order.billing || {};
  const shipping = order.shipping_address || order.shipping || {};

  return (
    <div>
      <PageHeader
        title={`Order #${order.order_number}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Orders', to: '/orders' },
          { label: `#${order.order_number}` },
        ]}
        actions={
          <Link to="/orders">
            <Button variant="secondary">Back to Orders</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge variant={STATUS_COLORS[order.status] || 'default'}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment</p>
              <Badge variant={PAYMENT_COLORS[order.payment_status] || 'default'}>
                {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold">Rs {Number(order.total_price || order.total || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm">{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</p>
            </div>
          </div>

          {/* Items Table */}
          <h3 className="text-md font-semibold text-gray-900 mb-3">Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, i) => (
                  <tr key={item.id || i}>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        {(item.product_image || item.image) ? (
                          <img src={item.product_image || item.image} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-700">{item.product_title || item.product_name || item.title || '—'}</p>
                          {item.variant_sku && <p className="text-xs text-gray-400">SKU: {item.variant_sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">Rs {Number(item.price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">Rs {Number(item.subtotal || (item.price * item.quantity) || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {order.customer_name || order.customer?.name || '—'}</p>
              <p><span className="text-gray-500">Email:</span> {order.customer_email || order.customer?.email || order.email || '—'}</p>
              <p><span className="text-gray-500">Phone:</span> {order.customer_phone || order.customer?.phone || order.phone || '—'}</p>
            </div>
          </Card>

          {/* Billing Address */}
          {Object.keys(billing).length > 0 && (
            <Card className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Billing Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{billing.full_name || billing.name || ''}</p>
                <p>{billing.address_line_1 || billing.address || ''}</p>
                {billing.address_line_2 && <p>{billing.address_line_2}</p>}
                <p>{[billing.city, billing.state, billing.postal_code].filter(Boolean).join(', ')}</p>
                {billing.country && <p>{billing.country}</p>}
              </div>
            </Card>
          )}

          {/* Shipping Address */}
          {Object.keys(shipping).length > 0 && (
            <Card className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{shipping.full_name || shipping.name || ''}</p>
                <p>{shipping.address_line_1 || shipping.address || ''}</p>
                {shipping.address_line_2 && <p>{shipping.address_line_2}</p>}
                <p>{[shipping.city, shipping.state, shipping.postal_code].filter(Boolean).join(', ')}</p>
                {shipping.country && <p>{shipping.country}</p>}
              </div>
            </Card>
          )}

          {/* Payment Info */}
          <Card className="p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Method:</span> {order.payment_method || '—'}</p>
              <p><span className="text-gray-500">Transaction ID:</span> {order.transaction_id || '—'}</p>
              <p>
                <span className="text-gray-500">Status: </span>
                <Badge variant={PAYMENT_COLORS[order.payment_status] || 'default'}>
                  {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                </Badge>
              </p>
            </div>
          </Card>

          {/* Status Update */}
          <Card className="p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select
                  value={statusForm.status}
                  onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusChoices.map(c => (
                    <option key={c.value || c[0]} value={c.value || c[0]}>
                      {c.label || c[1]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={statusForm.payment_status}
                  onChange={e => setStatusForm(prev => ({ ...prev, payment_status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentStatusChoices.map(c => (
                    <option key={c.value || c[0]} value={c.value || c[0]}>
                      {c.label || c[1]}
                    </option>
                  ))}
                </select>
              </div>

              <Textarea
                label="Notes"
                value={statusForm.notes}
                onChange={e => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add a note..."
              />

              <Button type="submit" disabled={updating} className="w-full">
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
