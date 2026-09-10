import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  PackageCheck,
  ChevronRight,
} from 'lucide-react';
import { orderService } from '../../services/api/orders';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ORDER_STEPS = [
  { key: 'CREATED', label: 'Created' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'ASSIGNED_TO_TRIP', label: 'Assigned' },
  { key: 'PICKUP_IN_PROGRESS', label: 'Pickup' },
  { key: 'PICKED_UP', label: 'Picked' },
  { key: 'IN_TRANSIT', label: 'Transit' },
  { key: 'ARRIVED_AT_HUB', label: 'Hub Arrived' },
  { key: 'SORTED', label: 'Sorted' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus || selectedStatus === order?.status) return;
    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(id, { status: selectedStatus });
      setOrder(updated);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading order progression..." fullPage />;
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve order details.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Order #{order.orderNumber || order.id.slice(0, 8)}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Status Transition Toolbar */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <label className="text-xs font-semibold text-slate-600 px-2">Update Lifecycle:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest/20 font-medium"
          >
            <option value="CREATED">CREATED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ASSIGNED_TO_TRIP">ASSIGNED TO TRIP</option>
            <option value="PICKUP_IN_PROGRESS">PICKUP IN PROGRESS</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="ARRIVED_AT_HUB">ARRIVED AT HUB</option>
            <option value="SORTED">SORTED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.status}
            className="px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            {updating ? 'Saving...' : 'Apply Status'}
          </button>
        </div>
      </div>

      {/* 12-Step Lifecycle Progression Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Order State Machine Flow
        </h2>
        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5" />
            This order was {order.status}.
          </div>
        ) : (
          <div className="flex items-center min-w-[760px] justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
            {ORDER_STEPS.map((step, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-forest text-white'
                        : isCurrent
                        ? 'bg-amber text-forest-dark ring-4 ring-amber/20'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium text-center ${
                      isCurrent ? 'text-forest font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Buyer & Delivery Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-forest" />
            Buyer & Delivery Destination
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Buyer Business:</span>
              <span className="font-bold text-slate-800">{order.buyer?.businessName || 'Wholesale Partner'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800">{order.buyer?.user?.name} ({order.buyer?.user?.phone})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="font-semibold text-slate-800 text-right">
                {[order.deliveryAddress || order.buyer?.address, order.buyer?.city, order.buyer?.state].filter(Boolean).join(', ') || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Order Amount:</span>
              <span className="font-bold text-forest text-sm">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            {order.notes && (
              <div className="p-3 bg-slate-50 rounded-xl mt-2 text-slate-700">
                <span className="font-semibold block text-[11px] text-slate-500 mb-1">Order Notes:</span>
                {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Order Line Items */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-forest" />
            Crop Line Items ({order.items?.length || 1})
          </h2>

          {order.items && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Crop / Item</th>
                    <th className="pb-3 px-3">Quantity</th>
                    <th className="pb-3 px-3">Unit Price</th>
                    <th className="pb-3 px-3">Line Total</th>
                    <th className="pb-3 px-3">Batch Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.crop?.name || 'Produce Item'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{item.quantity} {item.unit || 'KG'}</td>
                      <td className="py-3 px-3 text-slate-700">₹{item.pricePerUnit}/{item.unit || 'KG'}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{(item.totalPrice || item.quantity * item.pricePerUnit).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {item.supplyBatchId ? (
                          <Link to={`/supply/${item.supplyBatchId}`} className="text-forest hover:underline">
                            #{item.supplyBatchId.slice(0, 8)}
                          </Link>
                        ) : (
                          'Aggregated'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No order line items listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};
