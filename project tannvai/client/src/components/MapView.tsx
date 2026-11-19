import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IncidentReport, IncidentCategory, IncidentStatus } from '../types';

interface MapViewProps {
  reports?: IncidentReport[];
  selectedReportId?: string | null;
  onSelectReport?: (report: IncidentReport) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPickerMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  FLOOD: '#06b6d4', // Cyan
  ROAD_HAZARD: '#f59e0b', // Amber
  FIRE: '#ef4444', // Red
  UTILITY_OUTAGE: '#eab308', // Yellow
  MEDICAL_EMERGENCY: '#f43f5e', // Rose
  SHELTER_REQUEST: '#10b981', // Emerald
  STRUCTURAL_DAMAGE: '#8b5cf6', // Violet
  OTHER: '#64748b', // Slate
};

const STATUS_BORDER_COLORS: Record<string, string> = {
  UNVERIFIED: '#f59e0b',
  UNDER_REVIEW: '#3b82f6',
  VERIFIED: '#10b981',
  RESOLVED: '#8b5cf6',
  FLAGGED_CONFLICT: '#ef4444',
};

export const MapView: React.FC<MapViewProps> = ({
  reports = [],
  selectedReportId,
  onSelectReport,
  center = [37.7749, -122.4194], // Metro Bay / Riverdale District default
  zoom = 13,
  height = '500px',
  isPickerMode = false,
  pickedLocation,
  onPickLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark-themed tiles for emergency operations aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle picker mode click
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isPickerMode && onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Incident Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const catColor = CATEGORY_COLORS[report.category] || '#64748b';
      const statusColor = STATUS_BORDER_COLORS[report.status] || '#f59e0b';
      const isSelected = selectedReportId === report.id;
      const isUnverified = report.status === 'UNVERIFIED';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            ${isUnverified ? `<div style="
              position: absolute;
              inset: -4px;
              border-radius: 50%;
              border: 2px dashed ${statusColor};
              animation: spin 8s linear infinite;
              opacity: 0.8;
            "></div>` : ''}
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: #0f172a;
              border: 3px solid ${catColor};
              border-radius: 50%;
              box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${catColor}aa, 0 4px 6px -1px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: ${statusColor};
                border-radius: 50%;
              "></div>
            </div>
            ${report.urgency === 'CRITICAL' ? `<span style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              background: #ef4444;
              border-radius: 50%;
              border: 2px solid #0f172a;
            "></span>` : ''}
          </div>
        `,
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      // Click to inspect report
      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      // Accessible Popup content (Strictly NO private contact info!)
      const popupHtml = `
        <div style="min-width: 220px; font-family: Inter, sans-serif; color: #0f172a; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${catColor};">
              ${report.category}
            </span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; font-weight: 600;">
              ${report.status}
            </span>
          </div>
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0; line-height: 1.3;">
            ${report.title}
          </h4>
          <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
            ${report.locationName}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span>Urgency: <strong>${report.urgency}</strong></span>
            <span style="color: #0284c7; cursor: pointer; font-weight: 600;">Click to view</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersGroup.addLayer(marker);
    });
  }, [reports, selectedReportId]);

  // 3. Handle Picker Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedLocation) {
      if (!pickerMarkerRef.current) {
        const pickerIcon = L.divIcon({
          className: 'picker-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          html: `
            <div style="color: #06b6d4; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transform: translateY(-4px);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#06b6d4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#0f172a"></circle>
              </svg>
            </div>
          `,
        });
        pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], { icon: pickerIcon }).addTo(map);
      } else {
        pickerMarkerRef.current.setLatLng([pickedLocation.lat, pickedLocation.lng]);
      }
      map.panTo([pickedLocation.lat, pickedLocation.lng]);
    } else if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }
  }, [pickedLocation]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-navy-950">
      <div ref={mapContainerRef} style={{ height }} className="z-0" />
      {isPickerMode && (
        <div className="absolute top-3 left-14 z-[400] bg-navy-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs text-cyan-300 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          Click anywhere on the map to pin incident location
        </div>
      )}
    </div>
  );
};
