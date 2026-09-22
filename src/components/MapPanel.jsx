import React, { useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMapEvents } from 'react-leaflet';
import { MousePointer, Square, Circle, PenTool, Layers, Navigation } from 'lucide-react';

// Component to capture map lat/lng for HUD display
function MapCoordTracker({ setCoords, setZoom, onLocationChange }) {
  useMapEvents({
    mousemove(e) {
      const { lat, lng } = e.latlng;
      const formatted = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
      setCoords(formatted);
      if (onLocationChange) onLocationChange(formatted);
    },
    zoomend(e) {
      setZoom(e.target.getZoom());
    },
  });
  return null;
}

export default function MapPanel({ onLocationChange }) {
  const [activeTool, setActiveTool] = useState('select');
  const [coords, setCoords]   = useState('19.0760° N, 72.8777° E');
  const [zoom, setZoom]       = useState(13);
  const [layer, setLayer]     = useState('satellite');

  // Mumbai ISRO Headquarters vicinity
  const center = [19.0760, 72.8777];

  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, Earthstar Geographics'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap contributors © CARTO'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors, © OpenTopoMap'
    }
  };

  const tools = [
    { id: 'select', icon: <MousePointer size={15}/>, title: 'Select' },
    { id: 'box',    icon: <Square size={15}/>,       title: 'Draw Box' },
    { id: 'circle', icon: <Circle size={15}/>,       title: 'Draw Circle' },
    { id: 'draw',   icon: <PenTool size={15}/>,      title: 'Draw Polygon' },
  ];

  return (
    <div className="map-container">
      {/* Left Toolbar */}
      <div className="map-left-toolbar">
        {tools.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
            title={t.title}
            onClick={() => setActiveTool(t.id)}
          >
            {t.icon}
          </button>
        ))}
        <div style={{ width: '100%', height: '1px', background: 'var(--border-dark)', margin: '2px 0' }} />
        <button
          type="button"
          className={`tool-btn ${layer === 'satellite' ? 'active' : ''}`}
          title="Satellite Layer"
          onClick={() => setLayer('satellite')}
          style={{ fontSize: '0.62rem', fontWeight: 700 }}
        >
          SAT
        </button>
        <button
          type="button"
          className={`tool-btn ${layer === 'dark' ? 'active' : ''}`}
          title="Dark Map"
          onClick={() => setLayer('dark')}
        >
          <Layers size={15} />
        </button>
        <button
          type="button"
          className={`tool-btn ${layer === 'topo' ? 'active' : ''}`}
          title="Topographic"
          onClick={() => setLayer('topo')}
          style={{ fontSize: '0.58rem', fontWeight: 700 }}
        >
          TOPO
        </button>
      </div>

      {/* Top Right: Region badge */}
      <div className="map-top-right">
        <div className="map-region-badge">
          <Navigation size={13} className="icon-cyan" />
          <span>Mumbai, Maharashtra</span>
        </div>
      </div>

      {/* Real Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          key={layer}
          url={tileLayers[layer].url}
          attribution={tileLayers[layer].attribution}
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapCoordTracker
          setCoords={setCoords}
          setZoom={setZoom}
          onLocationChange={onLocationChange}
        />
      </MapContainer>

      {/* Bottom HUD */}
      <div className="map-hud">
        <Navigation size={12} className="icon-cyan" style={{ transform: 'rotate(-30deg)' }} />
        <span>N</span>
        <span className="map-hud-sep">|</span>
        <span>{coords}</span>
        <span className="map-hud-sep">|</span>
        <span>Zoom {zoom}</span>
        <span className="map-hud-sep">|</span>
        <span style={{ color: 'var(--tech-blue)', fontSize: '0.68rem', fontWeight: 600 }}>
          🛰 Live Tile Stream
        </span>
      </div>
    </div>
  );
}
