import React, { useState } from 'react';
import { Globe, Home, LayoutGrid, Clock, Scan, GitCompare, Target, TrendingUp, Settings, Sparkles } from 'lucide-react';

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">
          <Globe size={20} />
        </div>
        <div>
          <div className="brand-title">SATQUERY</div>
          <div className="brand-sub">Ask Earth. Understand Change.</div>
        </div>
      </div>

      {/* ISRO Badge */}
      <div className="isro-badge">
        🇮🇳 ISRO — Earth Observation Platform
      </div>

      {/* Nav */}
      <div className="nav-section-label">Navigation</div>
      <div className="nav-list">
        {[
          { id: 'home', icon: <Home size={16}/>, label: 'Home' },
          { id: 'workspace', icon: <LayoutGrid size={16}/>, label: 'Workspace' },
          { id: 'history', icon: <Clock size={16}/>, label: 'History' },
        ].map(({ id, icon, label }) => (
          <button key={id} className={`nav-btn ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="qa-box">
        <div className="qa-header">
          <Sparkles size={12} /> Quick Actions
        </div>
        {[
          { icon: <Scan size={14}/>, label: 'Analyze this image' },
          { icon: <GitCompare size={14}/>, label: 'Compare two dates' },
          { icon: <Target size={14}/>, label: 'Detect objects' },
          { icon: <TrendingUp size={14}/>, label: 'Find changes' },
        ].map(({ icon, label }) => (
          <button key={label} className="qa-btn">{icon} {label}</button>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="ai-pill">
          <div className="pulse-dot" />
          <div className="ai-pill-text">
            <strong>AI Engine Online</strong>
            <span>Ready to assist</span>
          </div>
        </div>
        <button className="settings-btn">
          <Settings size={16} /> Settings
        </button>
      </div>
    </aside>
  );
}
