import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Phone,
  CheckCircle2,
  XCircle,
  Route,
  AlertCircle,
  Car,
} from 'lucide-react';
import { driverService } from '../../services/api/drivers';
import { Driver } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DriverDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchDriver = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await driverService.getDriverById(id);
      setDriver(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!id) return;
    setVerifying(true);
    try {
      const updated = await driverService.verifyDriver(id, { status, reviewNotes });
      setDriver(updated);
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading driver profile..." fullPage />;
  }

  if (error || !driver) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Driver Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve driver profile.'}</p>
        <button
          onClick={() => navigate('/drivers')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Drivers
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
            to="/drivers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{driver.user?.name || driver.user?.fullName || 'Driver Profile'}</h1>
              <StatusBadge status={driver.status} />
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  driver.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {driver.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered on {new Date(driver.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Verification Action Bar */}
        {driver.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify('VERIFIED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify DL & Approve
            </button>
            <button
              onClick={() => handleVerify('REJECTED')}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject Driver
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center font-bold text-xl">
              {(driver.user?.name || driver.user?.fullName || 'D').charAt(0)}
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">{driver.user?.name || driver.user?.fullName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-forest" />
                {driver.user?.phone || 'No phone registered'}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Driving License:</span>
              <span className="font-mono font-bold text-slate-900">{driver.licenseNumber || 'Not recorded'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">License Category:</span>
              <span className="font-semibold text-slate-800">{driver.licenseType || 'COMMERCIAL HMV'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Experience:</span>
              <span className="font-semibold text-slate-800">{driver.experienceYears ? `${driver.experienceYears} Years` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Aadhar / ID Number:</span>
              <span className="font-mono text-slate-800">{driver.aadharNumber ? `•••• •••• ${driver.aadharNumber.slice(-4)}` : 'Submitted'}</span>
            </div>
            {driver.verificationNotes && (
              <div className="p-3 bg-slate-50 rounded-xl mt-2 text-slate-700">
                <span className="font-semibold block text-[11px] text-slate-500 mb-1">Verification Remarks:</span>
                {driver.verificationNotes}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Vehicles */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-forest" />
            Registered Transport Vehicles ({driver.vehicles?.length || 0})
          </h2>

          {driver.vehicles && driver.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {driver.vehicles.map((v) => {
                const capKg = Number(v.capacityKg || 0);
                return (
                  <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{v.registrationNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-semibold">
                        {v.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Model: <span className="font-semibold text-slate-800">{v.model || 'Standard Truck'}</span></div>
                      <div>Capacity: <span className="font-semibold text-slate-800">{capKg} kg</span> ({(capKg / 1000).toFixed(1)} MT)</div>
                      <div>Refrigeration: <span className="font-semibold text-slate-800">{v.hasRefrigeration ? 'Reefer / Cold Chain' : 'Ambient Dry'}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">No vehicles attached to this driver profile.</p>
          )}
        </div>
      </div>

      {/* Dispatch Trips History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-forest" />
          Assigned Dispatch Trips ({driver.trips?.length || 0})
        </h2>
        {driver.trips && driver.trips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Trip Code</th>
                  <th className="pb-3 px-3">Stops</th>
                  <th className="pb-3 px-3">Total Distance</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Created</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {driver.trips.map((t) => (
                  <tr key={t.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{t.tripNumber || t.id.slice(0, 8)}</td>
                    <td className="py-3 px-3 text-slate-600">{(t.stops || t.tripStops)?.length || 0} stops</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{t.totalDistanceKm ? `${t.totalDistanceKm} km` : '—'}</td>
                    <td className="py-3 px-3"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/trips/${t.id}`} className="text-forest font-semibold hover:underline">
                        Trip View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No trips assigned to this driver yet.</p>
        )}
      </div>
    </div>
  );
};
