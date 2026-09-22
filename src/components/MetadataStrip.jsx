import React from 'react';
import { MapPin, Grid, Cloud } from 'lucide-react';

export default function MetadataStrip({ coords }) {
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
        <span className="meta-label">Location</span>
        <span className="meta-val">{coords || '19.0760° N, 72.8777° E'}</span>
      </div>



    </div>
  );
}
