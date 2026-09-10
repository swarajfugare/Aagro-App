import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues in React bundler
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  type?: 'farm' | 'hub' | 'buyer' | 'truck' | string;
  description?: string;
}

export interface MapPoint {
  id: string;
  name: string;
  type: 'Farmer' | 'Driver' | 'Buyer' | 'Stop';
  latitude: number;
  longitude: number;
  status?: string;
  details?: string;
}

export interface OperationsMapProps {
  title?: string;
  markers?: MapMarker[];
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  title,
  markers = [],
  points = [],
  center = [18.5204, 73.8567], // Default to Maharashtra central logistics
  zoom = 8,
  height = '360px',
  className,
}) => {
  // Normalize points and markers into a single unified list
  const normalizedMarkers: MapMarker[] = [
    ...markers,
    ...points.map((pt) => ({
      id: pt.id,
      position: [pt.latitude, pt.longitude] as [number, number],
      title: pt.name,
      type: pt.type.toLowerCase(),
      description: pt.details || pt.status,
    })),
  ];

  const mapCenter =
    normalizedMarkers.length > 0 && normalizedMarkers[0].position
      ? normalizedMarkers[0].position
      : center;

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col',
        className,
      )}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">{title}</h3>
          <span className="text-[11px] text-slate-400 font-medium">
            {normalizedMarkers.length} Operations Nodes
          </span>
        </div>
      )}
      <div style={{ height }} className="relative w-full">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {normalizedMarkers.map((m) => (
            <Marker key={m.id} position={m.position}>
              <Popup>
                <div className="p-1">
                  {m.type && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                      {m.type}
                    </span>
                  )}
                  <h5 className="font-bold text-slate-900 text-xs mt-1">{m.title}</h5>
                  {m.description && (
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {normalizedMarkers.length === 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-slate-600 shadow-md border border-slate-200 z-[1000]">
            KrishiSetu Live Spatial Logistics
          </div>
        )}
      </div>
    </div>
  );
};
