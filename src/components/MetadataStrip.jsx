import React from 'react';
import { MapPin, Calendar, Square, Circle, PenTool } from 'lucide-react';

export default function MetadataStrip({ coords, aoiInfo, mapDate = '12 Mar 2024' }) {
  return (
    <div className="meta-strip">
      <div className="meta-source">
        <img src="/mumbai_satellite.jpg" alt="Sentinel-2" className="meta-source-thumb" />
        <div>
          <div className="meta-source-name">Sentinel-2 (Optical)</div>
          <div className="meta-source-sub">Multispectral</div>
        </div>
      </div>

      <div className="meta-item">
        <MapPin size={13} className="meta-icon" />
        <span className="meta-label">Location:</span>
        <span className="meta-val">{coords || '19.0760° N, 72.8777° E'}</span>
      </div>

      <div className="meta-item">
        <Calendar size={13} className="meta-icon" />
        <span className="meta-label">Pass Date:</span>
        <span className="meta-val">{mapDate}</span>
      </div>

      {aoiInfo?.area && (
        <div className="meta-item aoi-meta-badge">
          {aoiInfo.type === 'box' && <Square size={12} className="meta-icon aoi-icon" />}
          {aoiInfo.type === 'circle' && <Circle size={12} className="meta-icon aoi-icon" />}
          {aoiInfo.type === 'polygon' && <PenTool size={12} className="meta-icon aoi-icon" />}
          <span className="meta-label">Marked AOI:</span>
          <span className="meta-val aoi-val-highlight">{aoiInfo.area}</span>
          {aoiInfo.centerFormatted && (
            <span className="meta-val" style={{ opacity: 0.85, fontSize: '0.67rem' }}>
              ({aoiInfo.centerFormatted})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
