import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Building2,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { demandService } from '../../services/api/demand';
import { BuyerDemand } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DemandDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [demand, setDemand] = useState<BuyerDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemand = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await demandService.getDemandById(id);
      setDemand(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load demand requirement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading purchase demand details..." fullPage />;
  }

  if (error || !demand) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Demand Requirement Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve requirement details.'}</p>
        <button
          onClick={() => navigate('/demand')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Demands
        </button>
      </div>
    );
  }

  const targetQtyNum = Number(demand.targetQuantity || 0);
  const maxPriceNum = Number(demand.maxPricePerUnit || 0);

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/demand"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Demand #{demand.id.slice(0, 8)} — {demand.crop?.name}
              </h1>
              <StatusBadge status={demand.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged on {new Date(demand.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requirement Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">{demand.crop?.name}</div>
              <div className="text-xs text-slate-500">{demand.variety?.name || 'Any Quality Variety'}</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Target Quantity:</span>
              <span className="font-bold text-slate-900">{demand.targetQuantity} {demand.unit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Maximum Budget:</span>
              <span className="font-bold text-slate-900">
                {demand.maxPricePerUnit ? `₹${demand.maxPricePerUnit}/${demand.unit}` : 'Market Dynamic'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Estimated Total Value:</span>
              <span className="font-bold text-forest">
                {demand.maxPricePerUnit
                  ? `₹${(targetQtyNum * maxPriceNum).toLocaleString('en-IN')}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Required Date:</span>
              <span className="font-semibold text-slate-800">
                {demand.requiredByDate ? new Date(demand.requiredByDate).toLocaleDateString('en-IN') : 'Flexible'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Quality Grade Minimum:</span>
              <span className="font-bold text-amber-800 px-2 py-0.5 rounded bg-amber/10">
                {demand.qualityGradeMin || 'Grade B+'}
              </span>
            </div>
          </div>
        </div>

        {/* Buyer & Destination Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-forest" />
            Procuring Buyer & Delivery Endpoint
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-700">Buyer Business Profile</div>
              <div>Company: <strong className="text-slate-900">{demand.buyer?.businessName || 'Wholesale Buyer'}</strong></div>
              <div>Contact: <strong className="text-slate-800">{demand.buyer?.user?.name} ({demand.buyer?.user?.phone})</strong></div>
              <div>GST Number: <strong className="font-mono text-slate-700">{demand.buyer?.gstNumber || 'Unregistered'}</strong></div>
              <Link
                to={`/buyers/${demand.buyerId}`}
                className="inline-block mt-2 text-forest font-semibold hover:underline"
              >
                View Buyer Details →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-700">Delivery Location</div>
              <div className="flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span>
                  {[demand.buyer?.address, demand.buyer?.city, demand.buyer?.state, demand.buyer?.pincode].filter(Boolean).join(', ') || 'Registered warehouse address'}
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-500 block mb-1">Status:</span>
                <StatusBadge status={demand.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
