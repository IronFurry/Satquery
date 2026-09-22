import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapContainer, TileLayer, ZoomControl, useMapEvents,
  Rectangle, Circle as LeafletCircle, Polygon, Tooltip, Marker
} from 'react-leaflet';
import {
  MousePointer, Square, Circle, PenTool, Layers,
  Navigation, Trash2, Check, Crosshair, MapPin, Maximize2, Sparkles
} from 'lucide-react';
import L from 'leaflet';

// ─── GEODESIC CALCULATIONS (Accurate Earth Geometry) ─────────
const R = 6378137; // Earth equatorial radius in meters (WGS-84)

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Format coordinates with proper N/S and E/W direction letters
export function formatCoordinate(lat, lng) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return '0.0000° N, 0.0000° E';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// Calculate distance between two lat/lng points in meters (Haversine formula)
function computeDistance(p1, p2) {
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format area nicely (m², ha, km²)
function formatArea(sqMeters) {
  if (sqMeters >= 1000000) {
    return `${(sqMeters / 1000000).toFixed(2)} km²`;
  } else if (sqMeters >= 10000) {
    return `${(sqMeters / 10000).toFixed(2)} ha`;
  }
  return `${Math.round(sqMeters).toLocaleString()} m²`;
}

// Calculate Box Area, Center, and Bounding Coordinates
function getBoxMetrics(bounds) {
  const [[lat1, lng1], [lat2, lng2]] = bounds;
  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLng = Math.min(lng1, lng2);
  const maxLng = Math.max(lng1, lng2);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Exact spherical rectangle area on WGS84 sphere
  const dLngRad = Math.abs(toRad(maxLng - minLng));
  const sphericalArea = R * R * Math.abs(Math.sin(toRad(maxLat)) - Math.sin(toRad(minLat))) * dLngRad;

  const widthM = computeDistance({ lat: centerLat, lng: minLng }, { lat: centerLat, lng: maxLng });
  const heightM = computeDistance({ lat: minLat, lng: centerLng }, { lat: maxLat, lng: centerLng });

  return {
    center: [centerLat, centerLng],
    centerFormatted: formatCoordinate(centerLat, centerLng),
    nwFormatted: formatCoordinate(maxLat, minLng),
    seFormatted: formatCoordinate(minLat, maxLng),
    areaM2: sphericalArea,
    areaFormatted: formatArea(sphericalArea),
    widthFormatted: widthM >= 1000 ? `${(widthM / 1000).toFixed(2)} km` : `${Math.round(widthM)} m`,
    heightFormatted: heightM >= 1000 ? `${(heightM / 1000).toFixed(2)} km` : `${Math.round(heightM)} m`,
  };
}

// Calculate Circle Area, Center, and Metrics
function getCircleMetrics(center, radius) {
  const area = Math.PI * radius * radius;
  return {
    center,
    centerFormatted: formatCoordinate(center[0], center[1]),
    areaM2: area,
    areaFormatted: formatArea(area),
    radiusFormatted: radius >= 1000 ? `${(radius / 1000).toFixed(2)} km` : `${Math.round(radius)} m`,
  };
}

// Calculate Spherical Polygon Area and Centroid
function getPolygonMetrics(coords) {
  if (coords.length < 3) return { center: [0, 0], centerFormatted: '0.0000° N, 0.0000° E', areaM2: 0, areaFormatted: '0 m²' };

  let total = 0;
  let sumLat = 0;
  let sumLng = 0;

  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];
    sumLat += lat1;
    sumLng += lng1;
    const radLat1 = toRad(lat1);
    const radLat2 = toRad(lat2);
    const deltaLng = toRad(lng2 - lng1);
    total += deltaLng * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }

  const area = Math.abs((total * R * R) / 2);
  const centerLat = sumLat / coords.length;
  const centerLng = sumLng / coords.length;

  return {
    center: [centerLat, centerLng],
    centerFormatted: formatCoordinate(centerLat, centerLng),
    vertexCount: coords.length,
    areaM2: area,
    areaFormatted: formatArea(area),
  };
}

// ─── LEAFLET DRAWING ENGINE CONTROLLER ──────────────────────
function DrawingEngine({
  activeTool,
  setActiveTool,
  setCoords,
  setZoom,
  onShapeDrawn,
  activeShape,
  onClearShape,
  onLocationChange,
}) {
  const [drawingState, setDrawingState] = useState(null); // Box/Circle in progress
  const [polyPoints, setPolyPoints] = useState([]); // Polygon points in progress
  const [mousePos, setMousePos] = useState(null);

  const map = useMapEvents({
    mousemove(e) {
      const wrapped = e.latlng.wrap();
      setCoords(formatCoordinate(wrapped.lat, wrapped.lng));
      setMousePos(wrapped);

      if (drawingState && drawingState.isDrawing) {
        if (activeTool === 'box') {
          setDrawingState((prev) => ({
            ...prev,
            current: [wrapped.lat, wrapped.lng],
          }));
        } else if (activeTool === 'circle') {
          const dist = map.distance(drawingState.start, wrapped);
          setDrawingState((prev) => ({
            ...prev,
            radius: dist,
          }));
        }
      }
    },
    moveend(e) {
      const center = e.target.getCenter().wrap();
      const formatted = formatCoordinate(center.lat, center.lng);
      setCoords(formatted);
      // Update above location strip whenever the map is panned
      if (!activeShape && onLocationChange) {
        onLocationChange(formatted, null);
      }
    },
    zoomend(e) {
      setZoom(e.target.getZoom());
    },
    mousedown(e) {
      const wrapped = e.latlng.wrap();
      if (activeTool === 'box') {
        map.dragging.disable();
        const start = [wrapped.lat, wrapped.lng];
        setDrawingState({
          type: 'box',
          isDrawing: true,
          start,
          current: start,
        });
      } else if (activeTool === 'circle') {
        map.dragging.disable();
        const start = [wrapped.lat, wrapped.lng];
        setDrawingState({
          type: 'circle',
          isDrawing: true,
          start,
          radius: 10,
        });
      }
    },
    mouseup(e) {
      if (drawingState && drawingState.isDrawing) {
        map.dragging.enable();
        const wrapped = e.latlng.wrap();
        if (activeTool === 'box') {
          const start = drawingState.start;
          const end = [wrapped.lat, wrapped.lng];
          // Ensure non-zero box (at least ~50m)
          if (Math.abs(start[0] - end[0]) > 0.0003 && Math.abs(start[1] - end[1]) > 0.0003) {
            const bounds = [start, end];
            const metrics = getBoxMetrics(bounds);
            onShapeDrawn({
              type: 'box',
              bounds,
              ...metrics,
            });
            setActiveTool('select');
          }
          setDrawingState(null);
        } else if (activeTool === 'circle') {
          const radius = drawingState.radius;
          if (radius > 20) {
            const metrics = getCircleMetrics(drawingState.start, radius);
            onShapeDrawn({
              type: 'circle',
              center: drawingState.start,
              radius,
              ...metrics,
            });
            setActiveTool('select');
          }
          setDrawingState(null);
        }
      }
    },
    click(e) {
      if (activeTool === 'select') {
        const wrapped = e.latlng.wrap();
        const formatted = formatCoordinate(wrapped.lat, wrapped.lng);
        setCoords(formatted);
        // Clicking directly updates the above location too
        if (!activeShape && onLocationChange) {
          onLocationChange(formatted, null);
        }
      } else if (activeTool === 'draw') {
        const wrapped = e.latlng.wrap();
        const newPt = [wrapped.lat, wrapped.lng];
        // If clicking near the first point and have >= 3 points, close polygon
        if (polyPoints.length >= 3) {
          const distToStart = map.distance(newPt, polyPoints[0]);
          if (distToStart < 60) {
            const metrics = getPolygonMetrics(polyPoints);
            onShapeDrawn({
              type: 'polygon',
              points: polyPoints,
              ...metrics,
            });
            setPolyPoints([]);
            setActiveTool('select');
            map.dragging.enable();
            return;
          }
        }
        setPolyPoints((prev) => [...prev, newPt]);
      }
    },
    dblclick(e) {
      if (activeTool === 'draw' && polyPoints.length >= 3) {
        L.DomEvent.stop(e);
        const metrics = getPolygonMetrics(polyPoints);
        onShapeDrawn({
          type: 'polygon',
          points: polyPoints,
          ...metrics,
        });
        setPolyPoints([]);
        setActiveTool('select');
        map.dragging.enable();
      }
    },
  });

  // Enable/disable map dragging based on tool
  useEffect(() => {
    if (activeTool === 'select') {
      map.dragging.enable();
      setPolyPoints([]);
      setDrawingState(null);
    } else {
      map.dragging.disable();
    }
  }, [activeTool, map]);

  const finishPolygon = useCallback(() => {
    if (polyPoints.length >= 3) {
      const metrics = getPolygonMetrics(polyPoints);
      onShapeDrawn({
        type: 'polygon',
        points: polyPoints,
        ...metrics,
      });
      setPolyPoints([]);
      setActiveTool('select');
      map.dragging.enable();
    }
  }, [polyPoints, onShapeDrawn, setActiveTool, map]);

  return (
    <>
      {/* ── Active Shape Overlay (Persisted) ── */}
      {activeShape && activeShape.type === 'box' && (
        <Rectangle
          bounds={activeShape.bounds}
          pathOptions={{
            color: 'var(--accent)',
            weight: 2,
            fillColor: 'var(--accent)',
            fillOpacity: 0.18,
            dashArray: '4, 4',
          }}
        >
          <Tooltip permanent direction="top" className="aoi-leaflet-tooltip">
            <span style={{ fontWeight: 700 }}>AOI Box</span>: {activeShape.areaFormatted}
          </Tooltip>
        </Rectangle>
      )}

      {activeShape && activeShape.type === 'circle' && (
        <LeafletCircle
          center={activeShape.center}
          radius={activeShape.radius}
          pathOptions={{
            color: 'var(--accent)',
            weight: 2,
            fillColor: 'var(--accent)',
            fillOpacity: 0.18,
            dashArray: '4, 4',
          }}
        >
          <Tooltip permanent direction="top" className="aoi-leaflet-tooltip">
            <span style={{ fontWeight: 700 }}>AOI Radius</span> ({activeShape.radiusFormatted}): {activeShape.areaFormatted}
          </Tooltip>
        </LeafletCircle>
      )}

      {activeShape && activeShape.type === 'polygon' && (
        <Polygon
          positions={activeShape.points}
          pathOptions={{
            color: 'var(--accent)',
            weight: 2,
            fillColor: 'var(--accent)',
            fillOpacity: 0.18,
            dashArray: '4, 4',
          }}
        >
          <Tooltip permanent direction="top" className="aoi-leaflet-tooltip">
            <span style={{ fontWeight: 700 }}>Polygon AOI</span>: {activeShape.areaFormatted}
          </Tooltip>
        </Polygon>
      )}

      {/* ── Live Drawing In-Progress Previews ── */}
      {drawingState && drawingState.type === 'box' && drawingState.start && drawingState.current && (
        <Rectangle
          bounds={[drawingState.start, drawingState.current]}
          pathOptions={{
            color: 'var(--accent)',
            weight: 1.5,
            fillColor: 'var(--accent)',
            fillOpacity: 0.22,
            dashArray: '3, 3',
          }}
        />
      )}

      {drawingState && drawingState.type === 'circle' && drawingState.start && drawingState.radius && (
        <LeafletCircle
          center={drawingState.start}
          radius={drawingState.radius}
          pathOptions={{
            color: 'var(--accent)',
            weight: 1.5,
            fillColor: 'var(--accent)',
            fillOpacity: 0.22,
            dashArray: '3, 3',
          }}
        />
      )}

      {/* Polygon In-Progress Points and Segments */}
      {polyPoints.length > 0 && (
        <>
          <Polygon
            positions={mousePos ? [...polyPoints, [mousePos.lat, mousePos.lng]] : polyPoints}
            pathOptions={{
              color: 'var(--accent)',
              weight: 1.5,
              fillColor: 'var(--accent)',
              fillOpacity: 0.15,
              dashArray: '3, 3',
            }}
          />
          {/* Finish Polygon Floating Trigger Button */}
          {polyPoints.length >= 3 && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
              }}
            >
              <button
                type="button"
                className="finish-poly-btn"
                onClick={finishPolygon}
                title="Complete and close polygon AOI"
              >
                <Check size={14} />
                <span>Complete Polygon ({polyPoints.length} vertices)</span>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── MAIN MAP PANEL COMPONENT ──────────────────────────────
export default function MapPanel({ onLocationChange, onPasteAoiToChat }) {
  const [activeTool, setActiveTool] = useState('select');
  const [coords, setCoords] = useState('19.0760° N, 72.8777° E');
  const [zoom, setZoom] = useState(13);
  const [layer, setLayer] = useState('satellite');
  const [activeShape, setActiveShape] = useState(null);
  const [pastedFeedback, setPastedFeedback] = useState(false);

  // Mumbai Center
  const center = [19.0760, 72.8777];

  const handlePasteToChat = useCallback(() => {
    if (!activeShape) return;
    let queryText = '';
    if (activeShape.type === 'box') {
      queryText = `Analyze marked Box AOI [Area: ${activeShape.areaFormatted}, Center: ${activeShape.centerFormatted}, Bounds: NW ${activeShape.nwFormatted || ''} · SE ${activeShape.seFormatted || ''}]: Detect and count all structures, buildings, and land changes in this box.`;
    } else if (activeShape.type === 'circle') {
      queryText = `Analyze marked Radius AOI [Area: ${activeShape.areaFormatted}, Center: ${activeShape.centerFormatted}, Radius: ${activeShape.radiusFormatted}]: Detect and inspect all features in this circular zone.`;
    } else {
      queryText = `Analyze marked Polygon AOI [Area: ${activeShape.areaFormatted}, Centroid: ${activeShape.centerFormatted}, Vertices: ${activeShape.vertexCount} pts]: Detect all features inside this marked boundary.`;
    }

    if (onPasteAoiToChat) {
      onPasteAoiToChat(queryText);
    }
    setPastedFeedback(true);
    setTimeout(() => setPastedFeedback(false), 2000);
  }, [activeShape, onPasteAoiToChat]);

  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors, © OpenTopoMap',
    },
  };

  const tools = [
    { id: 'select', icon: <MousePointer size={15} />, title: 'Pointer / Pan Map' },
    { id: 'box', icon: <Square size={15} />, title: 'Draw Square / Bounding Box AOI' },
    { id: 'circle', icon: <Circle size={15} />, title: 'Draw Radius Circle AOI' },
    { id: 'draw', icon: <PenTool size={15} />, title: 'Pen Tool / Draw Polygon Area' },
  ];

  // Callback when a shape is completed
  const handleShapeDrawn = useCallback(
    (shape) => {
      setActiveShape(shape);
      const centerFormatted = shape.centerFormatted || formatCoordinate(shape.center[0], shape.center[1]);
      setCoords(centerFormatted);

      // Notify parent app of new position and calculated area
      if (onLocationChange) {
        onLocationChange(centerFormatted, {
          area: shape.areaFormatted,
          type: shape.type,
          center: shape.center,
          centerFormatted,
          nwFormatted: shape.nwFormatted,
          seFormatted: shape.seFormatted,
          widthFormatted: shape.widthFormatted,
          heightFormatted: shape.heightFormatted,
          radiusFormatted: shape.radiusFormatted,
          vertexCount: shape.vertexCount,
        });
      }
    },
    [onLocationChange]
  );

  const handleClearShape = useCallback(() => {
    setActiveShape(null);
    if (onLocationChange) {
      onLocationChange(coords, null);
    }
  }, [coords, onLocationChange]);

  return (
    <div className={`map-container tool-${activeTool}`}>
      {/* ── Left Toolbar ── */}
      <div className="map-left-toolbar">
        {tools.map((t) => (
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

        {activeShape && (
          <button
            type="button"
            className="tool-btn danger"
            title="Clear Marked AOI"
            onClick={handleClearShape}
          >
            <Trash2 size={14} />
          </button>
        )}

        <div className="map-toolbar-divider" />

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
          className={`tool-btn ${layer === 'topo' ? 'active' : ''}`}
          title="Topographic"
          onClick={() => setLayer('topo')}
          style={{ fontSize: '0.58rem', fontWeight: 700 }}
        >
          TOPO
        </button>
      </div>

      {/* ── Top Center: Active Drawing Tool Instructions ── */}
      {activeTool !== 'select' && (
        <div className="drawing-help-banner">
          <span className="drawing-help-icon">
            {activeTool === 'box' && <Square size={13} />}
            {activeTool === 'circle' && <Circle size={13} />}
            {activeTool === 'draw' && <PenTool size={13} />}
          </span>
          <span>
            {activeTool === 'box' && 'Click & drag on the map to define a bounding box AOI'}
            {activeTool === 'circle' && 'Click center and drag outward to define radius AOI'}
            {activeTool === 'draw' && 'Click points to trace boundary; double-click or click start to close'}
          </span>
          <button
            type="button"
            className="drawing-cancel-btn"
            onClick={() => setActiveTool('select')}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Top Right: Region & AOI Detected Metrics Badge ── */}
      <div className="map-top-right">
        {activeShape ? (
          <div className="map-aoi-detected-card">
            <div className="aoi-card-header">
              <span className="aoi-type-badge">
                {activeShape.type === 'box' && 'BOX AOI'}
                {activeShape.type === 'circle' && 'RADIUS AOI'}
                {activeShape.type === 'polygon' && 'POLYGON AOI'}
              </span>
              <button
                type="button"
                className="aoi-clear-icon-btn"
                onClick={handleClearShape}
                title="Remove marked AOI"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="aoi-metrics-grid">
              <div className="aoi-metric-row">
                <span className="aoi-metric-label">Area:</span>
                <span className="aoi-metric-val area-highlight">{activeShape.areaFormatted}</span>
              </div>
              <div className="aoi-metric-row">
                <span className="aoi-metric-label">Center:</span>
                <span className="aoi-metric-val">
                  {activeShape.centerFormatted}
                </span>
              </div>
              {activeShape.nwFormatted && activeShape.seFormatted && (
                <>
                  <div className="aoi-metric-row">
                    <span className="aoi-metric-label">NW Corner:</span>
                    <span className="aoi-metric-val">{activeShape.nwFormatted}</span>
                  </div>
                  <div className="aoi-metric-row">
                    <span className="aoi-metric-label">SE Corner:</span>
                    <span className="aoi-metric-val">{activeShape.seFormatted}</span>
                  </div>
                </>
              )}
              {activeShape.widthFormatted && (
                <div className="aoi-metric-row">
                  <span className="aoi-metric-label">Dimensions:</span>
                  <span className="aoi-metric-val">
                    {activeShape.widthFormatted} × {activeShape.heightFormatted}
                  </span>
                </div>
              )}
              {activeShape.radiusFormatted && (
                <div className="aoi-metric-row">
                  <span className="aoi-metric-label">Radius:</span>
                  <span className="aoi-metric-val">{activeShape.radiusFormatted}</span>
                </div>
              )}
              {activeShape.vertexCount && (
                <div className="aoi-metric-row">
                  <span className="aoi-metric-label">Vertices:</span>
                  <span className="aoi-metric-val">{activeShape.vertexCount} pts</span>
                </div>
              )}
            </div>
            <div className="aoi-card-footer">
              <button
                type="button"
                className={`aoi-paste-ai-btn ${pastedFeedback ? 'pasted' : ''}`}
                onClick={handlePasteToChat}
                title="Paste marked area and coordinates into the AI Chat"
              >
                {pastedFeedback ? <Check size={13} /> : <Sparkles size={13} />}
                <span>{pastedFeedback ? 'Pasted to AI Chat!' : 'Paste in Chat / AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="map-region-badge">
            <Navigation size={13} className="map-nav-icon" />
            <span>Mumbai, Maharashtra</span>
          </div>
        )}
      </div>

      {/* ── Real Leaflet Map ── */}
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

        <DrawingEngine
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          setCoords={setCoords}
          setZoom={setZoom}
          onShapeDrawn={handleShapeDrawn}
          activeShape={activeShape}
          onClearShape={handleClearShape}
          onLocationChange={onLocationChange}
        />
      </MapContainer>

      {/* ── Bottom HUD ── */}
      <div className="map-hud">
        <Navigation size={12} className="map-nav-icon" style={{ transform: 'rotate(-30deg)' }} />
        <span>N</span>
        <span className="map-hud-sep">|</span>
        <span className="hud-coords-mono">{coords}</span>
        <span className="map-hud-sep">|</span>
        <span>Pass: 12 Mar 2024</span>
        {activeShape && (
          <>
            <span className="map-hud-sep">|</span>
            <span className="hud-aoi-highlight">AOI: {activeShape.areaFormatted}</span>
            <span className="map-hud-sep">|</span>
            <span className="hud-coords-mono">Center: {activeShape.centerFormatted}</span>
          </>
        )}
        <span className="map-hud-sep">|</span>
        <span>Zoom {zoom}</span>
        <span className="map-hud-sep">|</span>
        <span className="map-live-stream-badge">
          <span className="live-led-dot" />
          <span>Live Tile Stream</span>
        </span>
      </div>
    </div>
  );
}
