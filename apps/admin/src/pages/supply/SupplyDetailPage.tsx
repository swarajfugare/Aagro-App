import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { supplyService } from '../../services/api/supply';
import { SupplyBatch } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SupplyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<SupplyBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await supplyService.getSupplyBatchById(id);
      setBatch(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load supply batch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading batch specifications..." fullPage />;
  }

  if (error || !batch) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Supply Batch Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve batch records.'}</p>
        <button
          onClick={() => navigate('/supply')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Supply
        </button>
      </div>
    );
  }

  const quantityNum = Number(batch.quantity || 0);
  const priceNum = Number(batch.basePricePerUnit || 0);

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/supply"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Batch #{batch.batchNumber || batch.id.slice(0, 8)}
              </h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Listed on {new Date(batch.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crop & Quality Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900">{batch.crop?.name}</div>
              <div className="text-xs text-slate-500">{batch.variety?.name || 'Standard Variety'}</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Quality Grade:</span>
              <span className="font-bold text-amber-800 px-2 py-0.5 rounded bg-amber/10">{batch.grade || batch.qualityGrade || 'Grade A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Quantity:</span>
              <span className="font-bold text-slate-900">{batch.quantity} {batch.unit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Available Quantity:</span>
              <span className="font-bold text-emerald-700">{batch.availableQuantity ?? batch.quantity} {batch.unit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Base Price Per Unit:</span>
              <span className="font-bold text-slate-900">₹{batch.basePricePerUnit}/{batch.unit}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Batch Value:</span>
              <span className="font-bold text-forest">₹{(quantityNum * priceNum).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Origin Farm & Producer Details */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-forest" />
            Farm Origin & Harvest Timeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-700">Producer Information</div>
              <div>Farmer: <strong className="text-slate-900">{batch.farmer?.user?.name || batch.farmer?.user?.fullName || 'Registered Farmer'}</strong></div>
              <div>Contact: <strong className="text-slate-800">{batch.farmer?.user?.phone || 'N/A'}</strong></div>
              <div className="text-slate-500">
                Location: {[batch.farmer?.village, batch.farmer?.district, batch.farmer?.state].filter(Boolean).join(', ')}
              </div>
              <Link
                to={`/farmers/${batch.farmerId}`}
                className="inline-block mt-2 text-forest font-semibold hover:underline"
              >
                View Farmer Profile →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="font-semibold text-slate-700">Harvest & Lifecycle</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Harvest Date: <strong>{batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('en-IN') : 'N/A'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expected Expiry: <strong>{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('en-IN') : 'Standard shelf life'}</strong></span>
              </div>
              <div>Status: <StatusBadge status={batch.status} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
