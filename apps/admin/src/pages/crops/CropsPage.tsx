import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, Search, Filter, Eye, Layers, Check } from 'lucide-react';
import { cropService } from '../../services/api/crops';
import { Crop } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCrop, setNewCrop] = useState({
    name: '',
    scientificName: '',
    category: 'VEGETABLE',
    defaultUnit: 'KG',
    shelfLifeDays: 7,
    idealStorageTempMin: 10,
    idealStorageTempMax: 15,
  });

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const data = await cropService.getCrops({
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      setCrops(data.crops || []);
    } catch (err) {
      console.error('Failed to fetch crops', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCrops();
  };

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cropService.createCrop({
        name: newCrop.name,
        scientificName: newCrop.scientificName || undefined,
        category: newCrop.category,
        defaultUnit: newCrop.defaultUnit,
        shelfLifeDays: Number(newCrop.shelfLifeDays) || 7,
        idealStorageTempMin: Number(newCrop.idealStorageTempMin) || undefined,
        idealStorageTempMax: Number(newCrop.idealStorageTempMax) || undefined,
      });
      setShowAddModal(false);
      setNewCrop({
        name: '',
        scientificName: '',
        category: 'VEGETABLE',
        defaultUnit: 'KG',
        shelfLifeDays: 7,
        idealStorageTempMin: 10,
        idealStorageTempMax: 15,
      });
      fetchCrops();
    } catch (err: any) {
      alert('Failed to add crop: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Crop>[] = [
    {
      header: 'Crop Name',
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold text-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{c.name}</div>
            <div className="text-xs italic text-slate-500">{c.scientificName || 'Botanical name unlisted'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (c) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest/10 text-forest">
          {c.category}
        </span>
      ),
    },
    {
      header: 'Varieties Registered',
      accessor: (c) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          {c.varieties?.length || 0} varieties
        </span>
      ),
    },
    {
      header: 'Default Unit',
      accessor: (c) => <span className="font-mono text-xs text-slate-700">{c.defaultUnit || 'KG'}</span>,
    },
    {
      header: 'Shelf Life',
      accessor: (c) => (
        <span className="text-xs text-slate-700">{c.shelfLifeDays ? `${c.shelfLifeDays} Days` : 'Perishable'}</span>
      ),
    },
    {
      header: 'Storage Temp',
      accessor: (c) => (
        <span className="text-xs text-slate-600">
          {c.idealStorageTempMin !== undefined && c.idealStorageTempMax !== undefined
            ? `${c.idealStorageTempMin}°C - ${c.idealStorageTempMax}°C`
            : 'Ambient'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (c) => (
        <Link
          to={`/crops/${c.id}`}
          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-forest hover:bg-forest/10 font-semibold text-xs transition-colors"
          title="Manage Crop"
        >
          <Eye className="w-4 h-4" />
          <span>Manage</span>
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
            <Sprout className="w-6 h-6 text-forest" />
            Crop Catalog & Agronomy Master
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Standardized crop varieties, harvest parameters, and cold-chain storage profiles.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Crop
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by crop name or botanical classification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
          >
            <option value="">All Categories</option>
            <option value="VEGETABLE">Vegetable</option>
            <option value="FRUIT">Fruit</option>
            <option value="GRAIN">Grain</option>
            <option value="PULSE">Pulse</option>
            <option value="SPICE">Spice</option>
            <option value="OILSEED">Oilseed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner text="Loading crop catalog..." />
      ) : (
        <DataTable
          columns={columns}
          data={crops}
          keyExtractor={(c) => c.id}
          emptyMessage="No crops found in catalog."
        />
      )}

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-forest" />
              Register New Crop
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Add a standardized crop species to the KrishiSetu agronomy directory.
            </p>

            <form onSubmit={handleCreateCrop} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Common Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tomato"
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scientific / Botanical Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Solanum lycopersicum"
                    value={newCrop.scientificName}
                    onChange={(e) => setNewCrop({ ...newCrop, scientificName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCrop.category}
                    onChange={(e) => setNewCrop({ ...newCrop, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  >
                    <option value="VEGETABLE">Vegetable</option>
                    <option value="FRUIT">Fruit</option>
                    <option value="GRAIN">Grain</option>
                    <option value="PULSE">Pulse</option>
                    <option value="SPICE">Spice</option>
                    <option value="OILSEED">Oilseed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Trading Unit *</label>
                  <select
                    value={newCrop.defaultUnit}
                    onChange={(e) => setNewCrop({ ...newCrop, defaultUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="QUINTAL">Quintal (100 kg)</option>
                    <option value="TON">Ton (1000 kg)</option>
                    <option value="CRATE">Crate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newCrop.shelfLifeDays}
                    onChange={(e) => setNewCrop({ ...newCrop, shelfLifeDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Temp (°C)</label>
                  <input
                    type="number"
                    value={newCrop.idealStorageTempMin}
                    onChange={(e) => setNewCrop({ ...newCrop, idealStorageTempMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Temp (°C)</label>
                  <input
                    type="number"
                    value={newCrop.idealStorageTempMax}
                    onChange={(e) => setNewCrop({ ...newCrop, idealStorageTempMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-forest hover:bg-forest-dark transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Save Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
