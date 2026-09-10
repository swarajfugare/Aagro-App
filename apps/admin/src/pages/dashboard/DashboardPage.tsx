import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Truck,
  TrendingUp,
  Package,
  ShoppingBag,
  Route,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/api/dashboard';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OperationsMap } from '../../components/maps/OperationsMap';
import { Link } from 'react-router-dom';

const CROP_COLORS = ['#1B4D3E', '#2E7D32', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading KrishiSetu command center..." fullPage />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-forest to-forest-dark text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-cream text-xs font-medium backdrop-blur-sm mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Operations Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">KrishiSetu Operations Hub</h1>
          <p className="text-forest-100 text-sm mt-1">
            Real-time farm-to-fork supply, demand, fulfillment, and logistics monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all backdrop-blur-sm border border-white/10 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber hover:bg-amber-600 text-forest-dark font-semibold text-sm transition-all shadow-sm active:scale-95"
          >
            Manage Orders
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchStats()} className="font-semibold underline hover:text-red-900">
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Farmers"
          value={stats?.farmersCount ?? 0}
          icon={Users}
          description="Registered agricultural producers"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Verified Buyers"
          value={stats?.buyersCount ?? 0}
          icon={Building2}
          description="Wholesalers & Institutions"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Available Drivers"
          value={stats?.driversCount ?? 0}
          icon={Truck}
          description="Active logistics partners"
        />
        <StatCard
          title="Active Supply"
          value={`${stats?.activeSupplyBatchesCount ?? 0}`}
          icon={Package}
          description="Batches available in market"
        />
        <StatCard
          title="Open Demand"
          value={`${stats?.openDemandCount ?? 0}`}
          icon={ShoppingBag}
          description="Pending purchase requests"
        />
        <StatCard
          title="Total Volume"
          value={`₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`}
          icon={TrendingUp}
          description="Processed GMV value"
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply vs Demand Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Supply vs Demand Balance (Tons)</h2>
              <p className="text-xs text-slate-500">Aggregated supply volume vs buyer demand across key regions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest" />
              <span className="text-xs text-slate-600 font-medium">Supply</span>
              <span className="w-3 h-3 rounded-full bg-amber ml-2" />
              <span className="text-xs text-slate-600 font-medium">Demand</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.supplyVsDemand || [
                  { period: 'Pune Hub', supply: 120, demand: 95 },
                  { period: 'Nashik Hub', supply: 180, demand: 160 },
                  { period: 'Nagpur Hub', supply: 90, demand: 110 },
                  { period: 'Solapur Hub', supply: 140, demand: 130 },
                  { period: 'Kolhapur Hub', supply: 85, demand: 70 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ display: 'none' }} />
                <Bar dataKey="supply" name="Supply (Tons)" fill="#1B4D3E" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="demand" name="Demand (Tons)" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Crop Category Distribution</h2>
            <p className="text-xs text-slate-500">Live active crop volume by category</p>
          </div>
          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={
                    stats?.cropDistribution && stats.cropDistribution.length > 0
                      ? stats.cropDistribution
                      : [
                          { cropName: 'Vegetables', count: 45 },
                          { cropName: 'Fruits', count: 25 },
                          { cropName: 'Grains & Pulses', count: 18 },
                          { cropName: 'Spices', count: 12 },
                        ]
                  }
                  dataKey="count"
                  nameKey="cropName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(stats?.cropDistribution || [1, 2, 3, 4]).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(stats?.cropDistribution && stats.cropDistribution.length > 0
              ? stats.cropDistribution.slice(0, 4)
              : [
                  { cropName: 'Vegetables', count: 45 },
                  { cropName: 'Fruits', count: 25 },
                  { cropName: 'Grains', count: 18 },
                  { cropName: 'Spices', count: 12 },
                ]
            ).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CROP_COLORS[idx % CROP_COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.cropName}</span>
                <span className="font-semibold text-slate-900 ml-auto">{item.count}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map & Live Operations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OperationsMap
            title="Live Supply Chain Geolocation"
            center={[18.5204, 73.8567]}
            zoom={8}
            height="380px"
            markers={[
              { id: '1', position: [18.5204, 73.8567], title: 'Pune Central Hub (Aggregator)', type: 'hub', description: '540 T stored, 12 trucks dispatching' },
              { id: '2', position: [19.9975, 73.7898], title: 'Nashik Farm Cluster', type: 'farm', description: 'Fresh Tomato & Onion Supply: 85 Tons ready' },
              { id: '3', position: [21.1458, 79.0882], title: 'Nagpur Orange Mandi', type: 'hub', description: 'Nagpur Mandarin direct farm lot' },
              { id: '4', position: [17.6599, 75.9064], title: 'Solapur Cluster', type: 'farm', description: 'Pomegranate & Millet producer cluster' },
              { id: '5', position: [19.0760, 72.8777], title: 'Mumbai APMC Terminal', type: 'buyer', description: 'Buyer fulfillment center' },
              { id: '6', position: [19.2, 73.5], title: 'Trip #TRIP-8091 (En Route)', type: 'truck', description: 'Driver: Ramesh Pawar | 15T Onions' },
            ]}
          />
        </div>

        {/* System Operations Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber" />
              Operational Alerts
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber/10 text-amber text-xs font-semibold">
              {stats?.alerts?.length || 3} Active
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {(stats?.alerts && stats.alerts.length > 0
              ? stats.alerts
              : [
                  {
                    id: '1',
                    type: 'warning',
                    title: 'Pending KYC Verifications',
                    message: '5 new farmers submitted Aadhar & 7/12 land records awaiting admin approval.',
                    timestamp: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    type: 'info',
                    title: 'Supply Surge: Tomatoes in Nashik',
                    message: 'Over 40 tons of Grade-A tomatoes posted in the last 6 hours.',
                    timestamp: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    type: 'warning',
                    title: 'Trip Delayed: TRIP-4092',
                    message: 'Logistics vehicle stuck near Khandala Ghat due to road diversion.',
                    timestamp: new Date().toISOString(),
                  },
                ]
            ).map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border text-xs ${
                  alert.type === 'warning'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : alert.type === 'error'
                    ? 'bg-red-50/60 border-red-200 text-red-900'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="font-semibold">{alert.title}</div>
                <p className="mt-1 text-slate-600 leading-relaxed">{alert.message}</p>
                <div className="mt-2 text-[10px] text-slate-400">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Supply Chain Orders</h2>
            <p className="text-xs text-slate-500">Live order matching and execution stream</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-forest hover:text-forest-dark inline-flex items-center gap-1"
          >
            View all orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Order Number</th>
                <th className="pb-3 px-3">Buyer</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.recentOrders && stats.recentOrders.length > 0
                ? stats.recentOrders
                : [
                    {
                      id: 'ord_1',
                      orderNumber: 'ORD-2026-0089',
                      buyerName: 'FreshKart Hypermarkets',
                      totalAmount: 145000,
                      status: 'CONFIRMED',
                      createdAt: new Date().toISOString(),
                    },
                    {
                      id: 'ord_2',
                      orderNumber: 'ORD-2026-0088',
                      buyerName: 'Sahyadri Agro Processing',
                      totalAmount: 320000,
                      status: 'DISPATCHED',
                      createdAt: new Date().toISOString(),
                    },
                    {
                      id: 'ord_3',
                      orderNumber: 'ORD-2026-0087',
                      buyerName: 'BigBasket Fulfillment Pune',
                      totalAmount: 89000,
                      status: 'DELIVERED',
                      createdAt: new Date().toISOString(),
                    },
                  ]
              ).map((order) => (
                <tr key={order.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{order.orderNumber}</td>
                  <td className="py-3 px-3 text-slate-700">{order.buyerName}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-forest hover:text-forest-dark font-semibold hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
