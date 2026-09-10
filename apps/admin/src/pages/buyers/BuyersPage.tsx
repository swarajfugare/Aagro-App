import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, CheckCircle2, XCircle, MapPin, Search, Filter } from 'lucide-react';
import { buyerService } from '../../services/api/buyers';
import { Buyer } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const BuyersPage: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; buyer: Buyer | null; action: 'VERIFIED' | 'REJECTED' }>({
    open: false,
    buyer: null,
    action: 'VERIFIED',
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const data = await buyerService.getBuyers({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setBuyers(data.buyers || []);
    } catch (err) {
      console.error('Failed to fetch buyers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBuyers();
  };

  const handleVerifySubmit = async () => {
    if (!verifyModal.buyer) return;
    setProcessing(true);
    try {
      await buyerService.verifyBuyer(verifyModal.buyer.id, {
        status: verifyModal.action,
        reviewNotes,
      });
      setVerifyModal({ open: false, buyer: null, action: 'VERIFIED' });
      setReviewNotes('');
      fetchBuyers();
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<Buyer>[] = [
    {
      header: 'Business Name',
      accessor: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber/10 text-amber-700 flex items-center justify-center font-bold text-sm">
            {b.businessName?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{b.businessName}</div>
            <div className="text-xs text-slate-500">{b.user?.name || b.user?.phone}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Business Type',
      accessor: (b) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {b.businessType ? b.businessType.replace('_', ' ') : 'COMMERCIAL'}
        </span>
      ),
    },
    {
      header: 'GST Number',
      accessor: (b) => (
        <span className="font-mono text-xs text-slate-700">{b.gstNumber || 'Not provided'}</span>
      ),
    },
    {
      header: 'Location',
      accessor: (b) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
          <span className="truncate">{[b.city, b.state].filter(Boolean).join(', ') || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'KYC Status',
      accessor: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          {b.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, buyer: b, action: 'VERIFIED' });
                }}
                title="Approve KYC"
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVerifyModal({ open: true, buyer: b, action: 'REJECTED' });
                }}
                title="Reject KYC"
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <Link
            to={`/buyers/${b.id}`}
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
            <Building2 className="w-6 h-6 text-forest" />
            Buyer Directory & Verification
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Institutional buyers, wholesalers, retailers, and food processors.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by business name, GST number, contact or city..."
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
        <LoadingSpinner text="Loading buyer records..." />
      ) : (
        <DataTable
          columns={columns}
          data={buyers}
          keyExtractor={(b) => b.id}
          emptyMessage="No buyers found matching criteria."
        />
      )}

      {/* KYC Review Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {verifyModal.action === 'VERIFIED' ? 'Approve Buyer Business' : 'Reject Buyer Application'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Business: <span className="font-semibold text-slate-800">{verifyModal.buyer?.businessName}</span> (GST: {verifyModal.buyer?.gstNumber || 'N/A'})
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Notes / GST Verification Log
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="E.g., GST Portal active registration and trade license verified."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyModal({ open: false, buyer: null, action: 'VERIFIED' })}
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
