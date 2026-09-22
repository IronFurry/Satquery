import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetadataStrip from './components/MetadataStrip';
import MapPanel from './components/MapPanel';
import RightPanel from './components/RightPanel';
import AskPanel from './components/AskPanel';
import CenteredChatView from './components/CenteredChatView';

export default function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [viewMode, setViewMode] = useState('console'); // 'console' | 'chat'
  const [theme, setTheme] = useState('dark'); // 'dark' (proper black) | 'light' (warm instrument)
  const [coords, setCoords] = useState('19.0760° N, 72.8777° E');

  const handleQuery = (q) => {
    console.log('[SatQuery Analysis]:', q);
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      {/* ── Sidebar ── */}
      <Sidebar active={activeNav} setActive={setActiveNav} />

      {/* ── Main Panel ── */}
      <div className="main-panel">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          theme={theme}
          setTheme={setTheme}
        />
        <MetadataStrip coords={coords} />

        {/* ── View: Map Console vs Centered AI Chat ── */}
        {viewMode === 'console' ? (
          <div className="workspace-grid">
            <div className="map-and-ask-col">
              <MapPanel onLocationChange={setCoords} />
              <AskPanel onSendQuery={handleQuery} />
            </div>
            <div className="insights-col">
              <RightPanel />
            </div>
          </div>
        ) : (
          <CenteredChatView onSwitchToMap={() => setViewMode('console')} />
        )}
      </div>
    </div>
  );
}
