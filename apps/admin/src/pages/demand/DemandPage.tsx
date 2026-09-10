import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, MapPin, Search, Filter, Calendar } from 'lucide-react';
import { demandService } from '../../services/api/demand';
import { BuyerDemand } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DemandPage: React.FC = () => {
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemands({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setDemands(data.demands || []);
    } catch (err) {
      console.error('Failed to fetch demand requirements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDemands();
  };

  const columns: Column<BuyerDemand>[] = [
    {
      header: 'Buyer / Business',
      accessor: (d) => (
        <div>
          <div className="font-semibold text-slate-900">{d.buyer?.businessName || 'Commercial Buyer'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-forest" />
            <span>{[d.buyer?.city, d.buyer?.state].filter(Boolean).join(', ') || 'Delivery destination'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Crop Requested',
      accessor: (d) => (
        <div>
          <div className="font-semibold text-slate-900">{d.crop?.name || 'Crop Requirement'}</div>
          <div className="text-xs text-slate-500">{d.variety?.name || 'Any Variety'}</div>
        </div>
      ),
    },
    {
      header: 'Target Quantity',
      accessor: (d) => (
        <span className="font-bold text-slate-900">{d.targetQuantity} {d.unit}</span>
      ),
    },
    {
      header: 'Max Budget Price',
      accessor: (d) => (
        <span className="font-semibold text-slate-900">
          {d.maxPricePerUnit ? `₹${d.maxPricePerUnit}/${d.unit}` : 'Market Price'}
        </span>
      ),
    },
    {
      header: 'Required By Date',
      accessor: (d) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {d.requiredByDate ? new Date(d.requiredByDate).toLocaleDateString('en-IN') : 'Immediate'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => <StatusBadge status={d.status} />,
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (d) => (
        <Link
          to={`/demand/${d.id}`}
          className="p-1.5 rounded-lg text-forest hover:bg-forest/10 transition-colors inline-block"
          title="View Demand Details"
        >
          <Eye className="w-4 h-4" />
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
            <ShoppingBag className="w-6 h-6 text-forest" />
            Buyer Purchase Demand Requirements
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Aggregated institutional buyer orders, procurement RFQs, and target price constraints.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by buyer name, crop, city or demand ID..."
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
            <option value="">All Demand Statuses</option>
            <option value="OPEN">Open</option>
            <option value="MATCHING">Matching</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading purchase requirements..." />
      ) : (
        <DataTable
          columns={columns}
          data={demands}
          keyExtractor={(d) => d.id}
          emptyMessage="No buyer demand requirements found matching criteria."
        />
      )}
    </div>
  );
};
