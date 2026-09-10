import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye, CheckCircle2, XCircle, MapPin, Search, Filter } from 'lucide-react';
import { farmerService } from '../../services/api/farmers';
import { Farmer } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; farmer: Farmer | null; action: 'VERIFIED' | 'REJECTED' }>({
    open: false,
    farmer: null,
    action: 'VERIFIED',
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await farmerService.getFarmers({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setFarmers(data.farmers || []);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFarmers();
  };

  const handleVerifySubmit = async () => {
    if (!verifyModal.farmer) return;
    setProcessing(true);
    try {
      await farmerService.verifyFarmer(verifyModal.farmer.id, {
        status: verifyModal.action,
        reviewNotes,
      });
      setVerifyModal({ open: false, farmer: null, action: 'VERIFIED' });
      setReviewNotes('');
      fetchFarmers();
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<Farmer>[] = [
    {
      header: 'Farmer Name',
      accessor: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-sm">
            {f.user?.name ? f.user.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{f.user?.name || 'Unnamed Farmer'}</div>
            <div className="text-xs text-slate-500">{f.user?.phone || 'No phone'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (f) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
          <span className="truncate">
            {[f.village, f.district, f.state].filter(Boolean).join(', ') || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Land (Acres)',
      accessor: (f) => (
        <span className="font-medium text-slate-900">{f.landSizeAcres ? `${f.landSizeAcres} ac` : '—'}</span>
      ),
    },
    {
      header: 'Experience',
      accessor: (f) => (
        <span className="text-slate-600">{f.experienceYears ? `${f.experienceYears} yrs` : '—'}</span>
      ),
    },
    {
      header: 'Farms Count',
      accessor: (f) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {f.farms?.length ?? 0} {f.farms?.length === 1 ? 'plot' : 'plots'}
        </span>
      ),
    },
    {
      header: 'KYC Status',
      accessor: (f) => <StatusBadge status={f.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (f) => (
        <div className="flex items-center justify-end gap-1.5">
          {f.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, farmer: f, action: 'VERIFIED' });
                }}
                title="Approve KYC"
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, farmer: f, action: 'REJECTED' });
                }}
                title="Reject KYC"
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <Link
            to={`/farmers/${f.id}`}
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
            <Users className="w-6 h-6 text-forest" />
            Farmer Directory & KYC
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage registered agricultural producers, land records, and verification status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by farmer name, phone, village or district..."
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
            <option value="">All KYC Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading farmer records..." />
      ) : (
        <DataTable
          columns={columns}
          data={farmers}
          keyExtractor={(f) => f.id}
          emptyMessage="No farmers found matching criteria."
        />
      )}

      {/* KYC Review Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {verifyModal.action === 'VERIFIED' ? 'Approve Farmer Verification' : 'Reject Farmer Verification'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Farmer: <span className="font-semibold text-slate-800">{verifyModal.farmer?.user?.name}</span> ({verifyModal.farmer?.user?.phone})
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Notes / Verification Remarks
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="E.g., 7/12 land extract verified with revenue department records."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyModal({ open: false, farmer: null, action: 'VERIFIED' })}
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
