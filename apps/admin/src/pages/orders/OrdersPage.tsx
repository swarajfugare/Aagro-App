import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Search, Filter, Calendar } from 'lucide-react';
import { orderService } from '../../services/api/orders';
import { Order } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const columns: Column<Order>[] = [
    {
      header: 'Order Number',
      accessor: (o) => (
        <div className="font-mono font-bold text-xs text-slate-900">
          {o.orderNumber || o.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: 'Buyer Organization',
      accessor: (o) => (
        <div>
          <div className="font-semibold text-slate-900">{o.buyer?.businessName || 'Institutional Buyer'}</div>
          <div className="text-xs text-slate-500">{o.buyer?.city || 'Direct delivery'}</div>
        </div>
      ),
    },
    {
      header: 'Items Count',
      accessor: (o) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {o.items?.length || 1} {o.items?.length === 1 ? 'crop line' : 'crop lines'}
        </span>
      ),
    },
    {
      header: 'Total Value',
      accessor: (o) => (
        <span className="font-bold text-slate-900">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Order Date',
      accessor: (o) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (o) => <StatusBadge status={o.status} />,
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (o) => (
        <Link
          to={`/orders/${o.id}`}
          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-forest hover:bg-forest/10 font-semibold text-xs transition-colors"
          title="Manage Order"
        >
          <Eye className="w-4 h-4" />
          <span>Timeline</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-forest" />
            Supply Chain Orders & Fulfillment
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            End-to-end multi-party orders, harvest allocations, payments, and dispatch progression.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number or buyer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
          >
            <option value="">All Order Statuses</option>
            <option value="CREATED">Created</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ASSIGNED_TO_TRIP">Assigned to Trip</option>
            <option value="PICKUP_IN_PROGRESS">Pickup in Progress</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED_AT_HUB">Arrived at Hub</option>
            <option value="SORTED">Sorted</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading orders ledger..." />
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(o) => o.id}
          emptyMessage="No orders found matching criteria."
        />
      )}
    </div>
  );
};
