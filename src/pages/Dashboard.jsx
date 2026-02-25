import { useState, useEffect } from 'react';
import { HiShoppingCart, HiUsers, HiShoppingBag, HiCalendar } from 'react-icons/hi';
import api from '../api';
import { PageHeader, StatCard, Card, LoadingSpinner } from '../components/UI';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome to your admin dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Orders" value={data?.total_orders || 0} icon={HiShoppingCart} color="blue" />
        <StatCard title="Total Customers" value={data?.total_customers || 0} icon={HiUsers} color="green" />
        <StatCard title="Today's Orders" value={data?.todays_orders || 0} icon={HiCalendar} color="purple" />
        <StatCard title="Active Products" value={data?.total_products || 0} icon={HiShoppingBag} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          {data?.top_selling_products?.length ? (
            <div className="space-y-3">
              {data.top_selling_products.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-700">{p.title}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{p.total_sold} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sales data yet</p>
          )}
        </Card>

        {/* Low Stock Products */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h2>
          {data?.low_stock_products?.length ? (
            <div className="space-y-3">
              {data.low_stock_products.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">{p.product_title}</p>
                    <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                  </div>
                  <span className={`text-sm font-medium ${p.stock <= 3 ? 'text-red-600' : 'text-yellow-600'}`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No low stock items</p>
          )}
        </Card>
      </div>
    </div>
  );
}
