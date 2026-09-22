import React from 'react';
import { Calendar, MapPin, Grid, Cloud } from 'lucide-react';

export default function MetadataStrip({ coords, date }) {
  return (
    <div className="meta-strip">
      <div className="meta-source">
        <img src="/mumbai_satellite.jpg" alt="Sentinel" className="meta-source-thumb" />
        <div>
          <div className="meta-source-name">Sentinel-2 (Optical)</div>
          <div className="meta-source-sub">Multispectral · L2A</div>
        </div>
      </div>

      <div className="meta-item">
        <Calendar size={13} className="icon-cyan" />
        <span className="meta-label">Date</span>
        <span className="meta-val">{date || '2024-06-18'}</span>
      </div>

      <div className="meta-item">
        <MapPin size={13} className="icon-cyan" />
        <span className="meta-label">Location</span>
        <span className="meta-val">{coords || '19.0760° N, 72.8777° E'}</span>
      </div>

      <div className="meta-item">
        <Grid size={13} className="icon-cyan" />
        <span className="meta-label">Resolution</span>
        <span className="meta-val">10 m</span>
      </div>

      <div className="meta-item">
        <Cloud size={13} className="icon-cyan" />
        <span className="meta-label">Cloud Cover</span>
        <span className="meta-val">3.2%</span>
      </div>
    </div>
  );
}
