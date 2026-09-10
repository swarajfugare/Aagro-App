import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { farmerService } from '../../services/api/farmers';
import { Farmer } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const FarmerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchFarmer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await farmerService.getFarmerById(id);
      setFarmer(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load farmer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmer();
  }, [id]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!id) return;
    setVerifying(true);
    try {
      const updated = await farmerService.verifyFarmer(id, { status, reviewNotes });
      setFarmer(updated);
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading farmer details..." fullPage />;
  }

  if (error || !farmer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Farmer Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve farmer profile.'}</p>
        <button
          onClick={() => navigate('/farmers')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Farmers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/farmers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{farmer.user?.name || 'Farmer Details'}</h1>
              <StatusBadge status={farmer.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Member since {new Date(farmer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Verification Action Bar */}
        {farmer.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify('VERIFIED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve KYC
            </button>
            <button
              onClick={() => handleVerify('REJECTED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject KYC
            </button>
          </div>
        )}
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center font-bold text-xl">
              {farmer.user?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">{farmer.user?.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-forest" />
                {farmer.user?.phone || 'No Phone Registered'}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Village / Location:</span>
              <span className="font-semibold text-slate-800 text-right">
                {[farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ') || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Land Area:</span>
              <span className="font-semibold text-slate-800">{farmer.landSizeAcres ? `${farmer.landSizeAcres} Acres` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Farming Experience:</span>
              <span className="font-semibold text-slate-800">{farmer.experienceYears ? `${farmer.experienceYears} Years` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Aadhar / ID Number:</span>
              <span className="font-mono text-slate-800">{farmer.aadharNumber ? `•••• •••• ${farmer.aadharNumber.slice(-4)}` : 'Submitted'}</span>
            </div>
            {farmer.verificationNotes && (
              <div className="p-3 bg-slate-50 rounded-xl mt-2 text-slate-700">
                <span className="font-semibold block text-[11px] text-slate-500 mb-1">Verification Remarks:</span>
                {farmer.verificationNotes}
              </div>
            )}
          </div>
        </div>

        {/* Registered Farms / Plots */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-forest" />
            Registered Farm Plots ({farmer.farms?.length || 0})
          </h2>

          {farmer.farms && farmer.farms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmer.farms.map((farm) => (
                <div key={farm.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-forest/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-slate-900">{farm.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-semibold">
                      {farm.areaAcres} Acres
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{[farm.village, farm.district, farm.state].filter(Boolean).join(', ')}</span>
                    </div>
                    {farm.soilType && <div>Soil: <span className="font-medium text-slate-700">{farm.soilType}</span></div>}
                    {farm.irrigationSource && <div>Irrigation: <span className="font-medium text-slate-700">{farm.irrigationSource}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No individual farm plots recorded yet.</p>
          )}
        </div>
      </div>

      {/* Posted Supply Batches */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-forest" />
          Active & Past Supply Batches
        </h2>
        {farmer.supplyBatches && farmer.supplyBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Batch Code</th>
                  <th className="pb-3 px-3">Crop Variety</th>
                  <th className="pb-3 px-3">Quantity</th>
                  <th className="pb-3 px-3">Base Price</th>
                  <th className="pb-3 px-3">Grade</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmer.supplyBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.batchNumber || b.id.slice(0, 8)}</td>
                    <td className="py-3 px-3 text-slate-700">{b.crop?.name || 'Crop Item'}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{b.quantity} {b.unit}</td>
                    <td className="py-3 px-3 text-slate-800">₹{b.basePricePerUnit}/{b.unit}</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{b.grade || 'A'}</span></td>
                    <td className="py-3 px-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/supply/${b.id}`} className="text-forest font-semibold hover:underline">
                        View Batch
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No supply listings posted by this farmer.</p>
        )}
      </div>
    </div>
  );
};
