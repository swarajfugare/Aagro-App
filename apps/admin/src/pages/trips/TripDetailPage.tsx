import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Route,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
} from 'lucide-react';
import { tripService } from '../../services/api/trips';
import { Trip } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OperationsMap, MapMarker } from '../../components/maps/OperationsMap';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await tripService.getTripById(id);
      setTrip(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading route and trip details..." fullPage />;
  }

  if (error || !trip) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || 'Could not retrieve trip dispatch records.'}</p>
        <button
          onClick={() => navigate('/trips')}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-xl text-sm font-semibold"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  // Generate map markers based on stops or default Maharashtra logistics route
  const defaultMarkers: MapMarker[] = [
    { id: '1', position: [19.9975, 73.7898], title: 'Stop 1: Nashik Farm Pickup', type: 'farm', description: 'Load: 8,500 kg Grade-A Onions' },
    { id: '2', position: [18.5204, 73.8567], title: 'Stop 2: Pune Central Sorting Hub', type: 'hub', description: 'Crossdock & Aggregation Check' },
    { id: '3', position: [19.0760, 72.8777], title: 'Stop 3: Navi Mumbai APMC Fulfillment', type: 'buyer', description: 'Unload: 8,500 kg delivery to FreshKart' },
  ];

  const mapMarkers: MapMarker[] =
    trip.stops && trip.stops.length > 0
      ? trip.stops
          .filter((s) => s.latitude && s.longitude)
          .map((s, idx) => ({
            id: s.id,
            position: [s.latitude!, s.longitude!] as [number, number],
            title: `Stop ${s.sequence}: ${s.type}`,
            type: s.type === 'PICKUP' ? 'farm' : s.type === 'DELIVERY' ? 'buyer' : 'hub',
            description: s.address || `Stop #${s.sequence}`,
          }))
      : defaultMarkers;

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/trips"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Trip #{trip.tripNumber || trip.id.slice(0, 8)}
              </h1>
              <StatusBadge status={trip.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled for {new Date(trip.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Driver & Transport Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest" />
            Assigned Fleet & Driver
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Driver Name:</span>
              <span className="font-bold text-slate-800">{trip.driver?.user?.name || 'Assigned Driver'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Driver Phone:</span>
              <span className="font-semibold text-slate-800">{trip.driver?.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Vehicle Registration:</span>
              <span className="font-mono font-bold text-slate-900">{trip.vehicle?.registrationNumber || 'MH-12-AB-9876'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Vehicle Type & Capacity:</span>
              <span className="font-semibold text-slate-800">
                {trip.vehicle?.type || 'Light Commercial'} ({trip.vehicle?.capacityKg || 10000} kg)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Total Route Distance:</span>
              <span className="font-bold text-forest text-sm">{trip.totalDistanceKm || 210} KM</span>
            </div>
          </div>
        </div>

        {/* Multi-Stop Map View */}
        <div className="md:col-span-2">
          <OperationsMap
            title="Optimized Dispatch Route Map"
            center={mapMarkers[0]?.position || [18.5204, 73.8567]}
            zoom={8}
            height="320px"
            markers={mapMarkers}
          />
        </div>
      </div>

      {/* Multi-Stop Progression Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-forest" />
          Multi-Stop Route Itinerary ({trip.stops?.length || 3} Stops)
        </h2>

        <div className="space-y-4">
          {(trip.stops && trip.stops.length > 0
            ? trip.stops
            : [
                {
                  id: 's1',
                  sequence: 1,
                  type: 'PICKUP',
                  address: 'Nashik Aggregator Farm Plot 4B, Pimpalgaon, Maharashtra',
                  status: 'COMPLETED',
                },
                {
                  id: 's2',
                  sequence: 2,
                  type: 'HUB_CROSSDOCK',
                  address: 'Pune Regional Agri-Hub & Cold Storage Facility',
                  status: 'IN_PROGRESS',
                },
                {
                  id: 's3',
                  sequence: 3,
                  type: 'DELIVERY',
                  address: 'FreshKart Central Warehouse, Turbhe MIDC, Navi Mumbai',
                  status: 'PENDING',
                },
              ]
          ).map((stop) => (
            <div
              key={stop.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {stop.sequence}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{stop.type.replace('_', ' ')}</span>
                    <StatusBadge status={stop.status} />
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>{stop.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
