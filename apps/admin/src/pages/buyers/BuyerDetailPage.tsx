import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  FileCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { buyerService } from '../../services/api/buyers';
import { Buyer } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const BuyerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchBuyer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await buyerService.getBuyerById(id);
      setBuyer(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load buyer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!id) return;
    setVerifying(true);
    try {
      const updated = await buyerService.verifyBuyer(id, { status, reviewNotes });
      setBuyer(updated);
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading buyer profile..." fullPage />;
  }

  if (error || !buyer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Buyer Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve buyer details.'}</p>
        <button
          onClick={() => navigate('/buyers')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Buyers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/buyers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{buyer.businessName}</h1>
              <StatusBadge status={buyer.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered on {new Date(buyer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Verification Action Bar */}
        {buyer.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify('VERIFIED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify GST & Approve
            </button>
            <button
              onClick={() => handleVerify('REJECTED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Application
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-amber/10 text-amber-700 flex items-center justify-center font-bold text-xl">
              {buyer.businessName?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">{buyer.businessName}</div>
              <div className="text-xs text-slate-500">{buyer.businessType?.replace('_', ' ') || 'COMMERCIAL BUYER'}</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Representative:</span>
              <span className="font-semibold text-slate-800">{buyer.user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-800">{buyer.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">{buyer.user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">GST Registration:</span>
              <span className="font-mono font-semibold text-slate-900">{buyer.gstNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">PAN Number:</span>
              <span className="font-mono text-slate-800">{buyer.panNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Billing Address:</span>
              <span className="font-semibold text-slate-800 text-right">
                {[buyer.address, buyer.city, buyer.state, buyer.pincode].filter(Boolean).join(', ') || 'N/A'}
              </span>
            </div>
            {buyer.verificationNotes && (
              <div className="p-3 bg-slate-50 rounded-xl mt-2 text-slate-700">
                <span className="font-semibold block text-[11px] text-slate-500 mb-1">Verification Remarks:</span>
                {buyer.verificationNotes}
              </div>
            )}
          </div>
        </div>

        {/* Active Demand / Requirements */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-forest" />
            Active Purchase Requirements ({buyer.demands?.length || 0})
          </h2>

          {buyer.demands && buyer.demands.length > 0 ? (
            <div className="space-y-3">
              {buyer.demands.map((demand) => (
                <div
                  key={demand.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{demand.crop?.name || 'Crop Demand'}</span>
                      <StatusBadge status={demand.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                      <span>Target: <strong className="text-slate-700">{demand.targetQuantity} {demand.unit}</strong></span>
                      {demand.maxPricePerUnit && <span>Max Price: <strong className="text-slate-700">₹{demand.maxPricePerUnit}/{demand.unit}</strong></span>}
                      {demand.requiredByDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Needed by {new Date(demand.requiredByDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/demand/${demand.id}`}
                    className="text-xs font-semibold text-forest hover:text-forest-dark px-3 py-1.5 rounded-lg bg-forest/10 hover:bg-forest/20 transition-colors shrink-0 text-center"
                  >
                    View Matching
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">No open purchase demands posted yet.</p>
          )}
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-forest" />
          Fulfillment Orders History ({buyer.orders?.length || 0})
        </h2>
        {buyer.orders && buyer.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Order Number</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Total Amount</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buyer.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{o.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-slate-600">{o.items?.length || 1} items</td>
                    <td className="py-3 px-3"><StatusBadge status={o.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/orders/${o.id}`} className="text-forest font-semibold hover:underline">
                        Order Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No orders placed by this buyer yet.</p>
        )}
      </div>
    </div>
  );
};
