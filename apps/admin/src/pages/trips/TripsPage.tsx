import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Route, Eye, Truck, Search, Filter, Calendar } from 'lucide-react';
import { tripService } from '../../services/api/trips';
import { Trip } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getTrips({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips();
  };

  const columns: Column<Trip>[] = [
    {
      header: 'Trip Code',
      accessor: (t) => (
        <div className="font-mono font-bold text-xs text-slate-900">
          {t.tripNumber || t.id.slice(0, 8)}
        </div>
      ),
    },
    {
      header: 'Assigned Driver',
      accessor: (t) => (
        <div>
          <div className="font-semibold text-slate-900">{t.driver?.user?.name || 'Unassigned'}</div>
          <div className="text-xs text-slate-500">{t.driver?.user?.phone || 'Awaiting assignment'}</div>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: (t) => (
        <div className="font-mono text-xs font-semibold text-slate-800">
          {t.vehicle?.registrationNumber || 'Fleet Vehicle'}
        </div>
      ),
    },
    {
      header: 'Multi-Stops',
      accessor: (t) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
          <Route className="w-3.5 h-3.5 text-forest" />
          {t.stops?.length || 2} stops
        </span>
      ),
    },
    {
      header: 'Est. Distance',
      accessor: (t) => (
        <span className="text-xs font-semibold text-slate-800">
          {t.totalDistanceKm ? `${t.totalDistanceKm} km` : '—'}
        </span>
      ),
    },
    {
      header: 'Scheduled Date',
      accessor: (t) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (t) => <StatusBadge status={t.status} />,
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (t) => (
        <Link
          to={`/trips/${t.id}`}
          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-forest hover:bg-forest/10 font-semibold text-xs transition-colors"
          title="View Multi-Stop Route"
        >
          <Eye className="w-4 h-4" />
          <span>Route Map</span>
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
            <Route className="w-6 h-6 text-forest" />
            Logistics Trips & Fleet Dispatch
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Optimized multi-stop farm pickups, hub aggregation, and buyer deliveries.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trip code, driver name, vehicle plate..."
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
            <option value="">All Trip Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="DRIVER_ASSIGNED">Driver Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading logistics dispatch runs..." />
      ) : (
        <DataTable
          columns={columns}
          data={trips}
          keyExtractor={(t) => t.id}
          emptyMessage="No trips found matching criteria."
        />
      )}
    </div>
  );
};
