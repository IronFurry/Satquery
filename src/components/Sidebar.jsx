import React from 'react';
import {
  Globe, Home, LayoutGrid, Clock, Scan, GitCompare,
  Target, TrendingUp, Settings
} from 'lucide-react';

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">
          <Globe size={18} />
        </div>
        <div>
          <div className="brand-title">SATQUERY</div>
          <div className="brand-sub">Ask Earth. Understand Change.</div>
        </div>
      </div>

      {/* ISRO Badge */}
      <div className="isro-badge">
        🇮🇳 ISRO — Earth Observation
      </div>

      {/* Navigation */}
      <div className="nav-section-label">Navigation</div>
      <div className="nav-list">
        {[
          { id: 'home', icon: <Home size={15} />, label: 'Home' },
          { id: 'workspace', icon: <LayoutGrid size={15} />, label: 'Workspace' },
          { id: 'history', icon: <Clock size={15} />, label: 'History' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            className={`nav-btn ${active === id ? 'active' : ''}`}
            onClick={() => setActive(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="qa-box">
        <div className="qa-header">Quick Actions</div>
        {[
          { icon: <Scan size={14} />, label: 'Analyze this image' },
          { icon: <GitCompare size={14} />, label: 'Compare two dates' },
          { icon: <Target size={14} />, label: 'Detect objects' },
          { icon: <TrendingUp size={14} />, label: 'Find changes' },
        ].map(({ icon, label }) => (
          <button key={label} type="button" className="qa-btn">
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Footer: Clean Settings (No AI Engine Online, No fake telemetry clutter) */}
      <div className="sidebar-footer">
        <button type="button" className="settings-btn">
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
