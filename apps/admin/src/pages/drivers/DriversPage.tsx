import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Eye, CheckCircle2, XCircle, Search, Filter, ShieldCheck } from 'lucide-react';
import { driverService } from '../../services/api/drivers';
import { Driver } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; driver: Driver | null; action: 'VERIFIED' | 'REJECTED' }>({
    open: false,
    driver: null,
    action: 'VERIFIED',
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getDrivers({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setDrivers(data.drivers || []);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers();
  };

  const handleVerifySubmit = async () => {
    if (!verifyModal.driver) return;
    setProcessing(true);
    try {
      await driverService.verifyDriver(verifyModal.driver.id, {
        status: verifyModal.action,
        reviewNotes,
      });
      setVerifyModal({ open: false, driver: null, action: 'VERIFIED' });
      setReviewNotes('');
      fetchDrivers();
    } catch (err) {
      console.error('Driver verification failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<Driver>[] = [
    {
      header: 'Driver Name',
      accessor: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-sm">
            {d.user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{d.user?.name || 'Unnamed Driver'}</div>
            <div className="text-xs text-slate-500">{d.user?.phone}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'License Details',
      accessor: (d) => (
        <div>
          <div className="font-mono text-xs font-semibold text-slate-800">{d.licenseNumber || 'Pending'}</div>
          <div className="text-[11px] text-slate-500">{d.licenseType || 'COMMERCIAL HMV'}</div>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: (d) => {
        const vehicle = d.vehicles && d.vehicles.length > 0 ? d.vehicles[0] : null;
        return vehicle ? (
          <div>
            <div className="font-semibold text-xs text-slate-900">{vehicle.registrationNumber}</div>
            <div className="text-[11px] text-slate-500">
              {vehicle.type} ({vehicle.capacityKg} kg)
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">No vehicle linked</span>
        );
      },
    },
    {
      header: 'Live Status',
      accessor: (d) => {
        const isOnline = d.isAvailable;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {isOnline ? 'AVAILABLE' : 'OFFLINE / ON TRIP'}
          </span>
        );
      },
    },
    {
      header: 'KYC Status',
      accessor: (d) => <StatusBadge status={d.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          {d.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, driver: d, action: 'VERIFIED' });
                }}
                title="Verify Driver License"
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, driver: d, action: 'REJECTED' });
                }}
                title="Reject License"
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <Link
            to={`/drivers/${d.id}`}
            className="p-1.5 rounded-lg text-forest hover:bg-forest/10 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-forest" />
            Driver & Fleet Partner Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Verified commercial drivers, transport capacity, and real-time fleet availability.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by driver name, phone, license or vehicle plate..."
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
            <option value="">All Verification Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading fleet records..." />
      ) : (
        <DataTable
          columns={columns}
          data={drivers}
          keyExtractor={(d) => d.id}
          emptyMessage="No drivers found matching criteria."
        />
      )}

      {/* Driver License Verification Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest" />
              {verifyModal.action === 'VERIFIED' ? 'Approve Driver License & KYC' : 'Reject Driver Application'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Driver: <span className="font-semibold text-slate-800">{verifyModal.driver?.user?.name}</span> (DL: {verifyModal.driver?.licenseNumber || 'N/A'})
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                RTO / Transport Authority Verification Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="E.g., Sarathi DL database verified with commercial heavy badge."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyModal({ open: false, driver: null, action: 'VERIFIED' })}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifySubmit}
                disabled={processing}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                  verifyModal.action === 'VERIFIED'
                    ? 'bg-forest hover:bg-forest-dark'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {processing ? 'Processing...' : verifyModal.action === 'VERIFIED' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
