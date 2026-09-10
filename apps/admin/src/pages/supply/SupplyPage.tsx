import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, MapPin, Search, Filter, Calendar } from 'lucide-react';
import { supplyService } from '../../services/api/supply';
import { SupplyBatch } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SupplyPage: React.FC = () => {
  const [batches, setBatches] = useState<SupplyBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSupply = async () => {
    setLoading(true);
    try {
      const data = await supplyService.getSupplyBatches({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setBatches(data.batches || []);
    } catch (err) {
      console.error('Failed to fetch supply batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupply();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSupply();
  };

  const columns: Column<SupplyBatch>[] = [
    {
      header: 'Batch Code',
      accessor: (b) => (
        <div className="font-mono font-bold text-xs text-slate-900">
          {b.batchNumber || b.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: 'Crop / Variety',
      accessor: (b) => (
        <div>
          <div className="font-semibold text-slate-900">{b.crop?.name || 'Crop'}</div>
          <div className="text-xs text-slate-500">{b.variety?.name || 'Standard Variety'}</div>
        </div>
      ),
    },
    {
      header: 'Farmer & Location',
      accessor: (b) => (
        <div>
          <div className="font-medium text-slate-800">{b.farmer?.user?.name || 'Farmer'}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-forest" />
            <span>{[b.farmer?.village, b.farmer?.district].filter(Boolean).join(', ') || 'Farm origin'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Quantity Available',
      accessor: (b) => (
        <div>
          <span className="font-bold text-slate-900">{b.quantity} {b.unit}</span>
          {b.availableQuantity !== undefined && b.availableQuantity !== b.quantity && (
            <span className="text-[11px] text-slate-500 block">({b.availableQuantity} {b.unit} left)</span>
          )}
        </div>
      ),
    },
    {
      header: 'Base Price',
      accessor: (b) => (
        <span className="font-semibold text-slate-900">₹{b.basePricePerUnit}/{b.unit}</span>
      ),
    },
    {
      header: 'Grade',
      accessor: (b) => (
        <span className="px-2 py-0.5 rounded bg-amber/10 text-amber-900 font-bold text-xs">
          {b.grade || 'Grade A'}
        </span>
      ),
    },
    {
      header: 'Harvest Date',
      accessor: (b) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {b.harvestDate ? new Date(b.harvestDate).toLocaleDateString('en-IN') : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (b) => (
        <Link
          to={`/supply/${b.id}`}
          className="p-1.5 rounded-lg text-forest hover:bg-forest/10 transition-colors inline-block"
          title="View Batch Details"
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
            <Package className="w-6 h-6 text-forest" />
            Supply Batches & Harvest Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time farm inventory, quality grading, and regional crop availability.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by crop, farmer name, batch ID or village..."
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
            <option value="">All Supply Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading supply inventory..." />
      ) : (
        <DataTable
          columns={columns}
          data={batches}
          keyExtractor={(b) => b.id}
          emptyMessage="No supply batches found matching criteria."
        />
      )}
    </div>
  );
};
