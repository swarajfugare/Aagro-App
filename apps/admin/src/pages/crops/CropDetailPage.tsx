import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sprout,
  Layers,
  Plus,
  Thermometer,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cropService } from '../../services/api/crops';
import { Crop } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CropDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVarietyModal, setShowVarietyModal] = useState(false);
  const [savingVariety, setSavingVariety] = useState(false);
  const [newVariety, setNewVariety] = useState({
    name: '',
    localName: '',
    maturityDays: 90,
    expectedYieldPerAcre: 15,
  });

  const fetchCrop = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await cropService.getCropById(id);
      setCrop(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const handleAddVariety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingVariety(true);
    try {
      await cropService.addVariety(id, {
        name: newVariety.name,
        localName: newVariety.localName || undefined,
        maturityDays: Number(newVariety.maturityDays) || undefined,
        expectedYieldPerAcre: Number(newVariety.expectedYieldPerAcre) || undefined,
      });
      setShowVarietyModal(false);
      setNewVariety({
        name: '',
        localName: '',
        maturityDays: 90,
        expectedYieldPerAcre: 15,
      });
      fetchCrop();
    } catch (err: any) {
      alert('Failed to add variety: ' + err.message);
    } finally {
      setSavingVariety(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading crop information..." fullPage />;
  }

  if (error || !crop) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Crop Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve crop profile.'}</p>
        <button
          onClick={() => navigate('/crops')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Crops
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
            to="/crops"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{crop.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-xs font-semibold">
                {crop.category}
              </span>
            </div>
            <p className="text-xs italic text-slate-500 mt-0.5">
              {crop.scientificName || 'Botanical classification unlisted'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowVarietyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Variety
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-forest" />
            Agronomy Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Trading Unit:</span>
              <span className="font-mono font-bold text-slate-900">{crop.defaultUnit || 'KG'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Post-Harvest Shelf Life:</span>
              <span className="font-semibold text-slate-800">{crop.shelfLifeDays ? `${crop.shelfLifeDays} Days` : 'Perishable'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Cold Chain Storage:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-forest" />
                {crop.idealStorageTempMin !== undefined && crop.idealStorageTempMax !== undefined
                  ? `${crop.idealStorageTempMin}°C to ${crop.idealStorageTempMax}°C`
                  : 'Ambient'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Registered Varieties:</span>
              <span className="font-semibold text-slate-800">{crop.varieties?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Varieties List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-forest" />
              Cultivar & Seed Varieties ({crop.varieties?.length || 0})
            </h2>
          </div>

          {crop.varieties && crop.varieties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {crop.varieties.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-sm text-slate-900">{v.name}</h3>
                    {v.localName && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber/10 text-amber-800 font-medium">
                        {v.localName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Maturity Cycle: <strong>{v.maturityDays || '—'} Days</strong></span>
                    </div>
                    <div>
                      Avg Yield: <strong>{v.expectedYieldPerAcre ? `${v.expectedYieldPerAcre} Tons/Acre` : '—'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">No specific varieties listed. Click "Add Variety" to register one.</p>
          )}
        </div>
      </div>

      {/* Add Variety Modal */}
      {showVarietyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-forest" />
              Add Variety for {crop.name}
            </h3>

            <form onSubmit={handleAddVariety} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variety Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Vaishali / Hybrid 105"
                  value={newVariety.name}
                  onChange={(e) => setNewVariety({ ...newVariety, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Local / Regional Name</label>
                <input
                  type="text"
                  placeholder="e.g., गावरान / देशी"
                  value={newVariety.localName}
                  onChange={(e) => setNewVariety({ ...newVariety, localName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maturity Days</label>
                  <input
                    type="number"
                    min="10"
                    value={newVariety.maturityDays}
                    onChange={(e) => setNewVariety({ ...newVariety, maturityDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yield (Tons/Acre)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVariety.expectedYieldPerAcre}
                    onChange={(e) => setNewVariety({ ...newVariety, expectedYieldPerAcre: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVarietyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVariety}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-forest hover:bg-forest-dark transition-all shadow-sm disabled:opacity-50"
                >
                  {savingVariety ? 'Saving...' : 'Add Variety'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
