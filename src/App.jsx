import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetadataStrip from './components/MetadataStrip';
import MapPanel from './components/MapPanel';
import RightPanel from './components/RightPanel';
import AskPanel from './components/AskPanel';

export default function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [coords, setCoords] = useState('19.0760° N, 72.8777° E');

  const handleQuery = (q) => {
    console.log('[SatQuery Analysis Triggered]:', q);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────── */}
      <Sidebar active={activeNav} setActive={setActiveNav} />

      {/* ── Main Panel ──────────────────────────── */}
      <div className="main-panel">
        <Header />
        <MetadataStrip coords={coords} />

        {/* ── Workspace Grid: Left Column (Map + Ask SatQuery) & Right Column (Insights) ── */}
        <div className="workspace-grid">
          <div className="map-and-ask-col">
            <MapPanel onLocationChange={setCoords} />
            <AskPanel onSendQuery={handleQuery} />
          </div>
          <div className="insights-col">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
