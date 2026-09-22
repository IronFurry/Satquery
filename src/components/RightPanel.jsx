import React, { useState } from 'react';
import {
  Building2, Target, Sparkles, Code,
  Lightbulb, Download, ArrowRight, TrendingUp, CheckCircle2
} from 'lucide-react';

export default function RightPanel({ aoiInfo }) {
  const [tab, setTab] = useState('ai');

  return (
    <div className="right-panel">
      {/* Tab Switcher */}
      <div className="panel-tabs">
        <button
          type="button"
          className={`ptab ${tab === 'ai' ? 'active' : ''}`}
          onClick={() => setTab('ai')}
        >
          <Sparkles size={13} />
          <span>AI Response</span>
        </button>
        <button
          type="button"
          className={`ptab ${tab === 'trace' ? 'active' : ''}`}
          onClick={() => setTab('trace')}
        >
          <Code size={13} />
          <span>Execution Trace</span>
        </button>
      </div>

      <div className="panel-content-area">
        {tab === 'ai' ? (
          <>
            {/* Detection Overview Card */}
            <div className="detect-card">
              <div className="detect-header">
                <div className="detect-header-left">
                  <div className="detect-icon">
                    <Building2 size={16} />
                  </div>
                  <span className="detect-title">142 Buildings Detected</span>
                </div>
                <span className="badge-green">High Confidence</span>
              </div>

              {aoiInfo?.area && (
                <div className="aoi-sync-banner">
                  <span className="aoi-sync-indicator" />
                  <span>
                    <strong>Target:</strong> Marked {aoiInfo.type?.toUpperCase()} ({aoiInfo.area})
                    {aoiInfo.centerFormatted && ` · ${aoiInfo.centerFormatted}`}
                  </span>
                </div>
              )}

              <p className="detect-desc">
                {aoiInfo?.area
                  ? `Analyzed marked ${aoiInfo.type} AOI (${aoiInfo.area} at ${aoiInfo.centerFormatted}). SAM-Geospatial structure detection resolved 142 distinct building footprints within the active boundary with 94.7% confidence.`
                  : 'I found 142 buildings in the selected area with an average confidence of 94.7%. Most of the buildings are concentrated in the central and eastern parts of the image.'}
              </p>

              <div className="stats-row">
                <div className="stat-block">
                  <Building2 size={15} className="stat-icon" />
                  <div>
                    <span className="stat-num">142</span>
                    <span className="stat-lbl">Buildings</span>
                  </div>
                </div>
                <div className="stat-block">
                  <Target size={15} className="stat-icon" />
                  <div>
                    <span className="stat-num">94.7%</span>
                    <span className="stat-lbl">Confidence</span>
                  </div>
                </div>
                <div className="stat-trend-wrap">
                  <TrendingUp size={18} className="stat-trend-icon" />
                </div>
              </div>
            </div>

            {/* Visual Evidence Card */}
            <div className="evidence-card">
              <div className="evidence-head">
                <span className="evidence-title">Visual Evidence</span>
                <button type="button" className="view-all-link">View All</button>
              </div>
              <div className="evidence-grid">
                <div className="evidence-img-wrap">
                  <img src="/mumbai_satellite.jpg" alt="Visual Evidence Satellite Crop" className="evidence-img" />
                  {/* Bounding box visual indicators */}
                  <div className="evidence-overlay-box b1" />
                  <div className="evidence-overlay-box b2" />
                  <div className="evidence-overlay-box b3" />
                  <div className="evidence-overlay-box b4" />
                </div>
                <div className="legend-col">
                  <div className="legend-item">
                    <div className="legend-dot-row">
                      <span className="dot-detected" />
                      <span>Detected Buildings</span>
                    </div>
                    <div className="legend-num">142</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot-row">
                      <span className="dot-uncertain" />
                      <span>Uncertain</span>
                    </div>
                    <div className="legend-num">12</div>
                  </div>
                  <div className="conf-bar-wrap">
                    <div className="conf-track">
                      <div className="conf-fill" style={{ width: '94.7%' }} />
                    </div>
                    <div className="conf-lbl">94.7% Avg. Confidence</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights Card */}
            <div className="insights-card">
              <div className="insights-head">
                <Lightbulb size={14} className="insights-bulb-icon" />
                <span>Key Insights</span>
              </div>
              <ul className="insights-list">
                <li>Buildings are densely concentrated in the central region.</li>
                <li>The eastern part shows lower density.</li>
                <li>Overall urban expansion is visible compared to nearby areas.</li>
              </ul>
              <div className="insights-actions">
                <button type="button" className="btn-insight-action">
                  <Download size={13} />
                  <span>Download Report</span>
                </button>
                <button type="button" className="btn-insight-action">
                  <ArrowRight size={13} />
                  <span>View in Workspace</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Execution Trace Tab */
          <div className="trace-card">
            <div className="trace-header">
              <span className="trace-pipeline-id">Pipeline #SAT-9481</span>
              <span className="badge-green">356ms · OK</span>
            </div>
            <div className="trace-steps">
              {[
                {
                  step: aoiInfo?.area
                    ? `Bounding Geometry Ingestion (${aoiInfo.type?.toUpperCase()} · ${aoiInfo.area})`
                    : 'Sentinel-2 L2A Ingestion',
                  time: '24ms'
                },
                { step: 'SAM-Geospatial Feature Inference', time: '180ms' },
                { step: 'Urban Footprint Polygon Vectorization', time: '42ms' },
                { step: 'Vision-Language Analytical Reasoner V3', time: '110ms' },
              ].map(({ step, time }, i) => (
                <div key={i} className="trace-step-item">
                  <CheckCircle2 size={13} className="trace-check-icon" />
                  <span className="trace-step-name">{i + 1}. {step}</span>
                  <span className="trace-step-time">{time}</span>
                </div>
              ))}
            </div>
            <div className="trace-raw-output">
              <div className="trace-json-title">Response GeoJSON Metadata</div>
              <pre className="trace-pre">
{aoiInfo?.area ? `{
  "source": "ISRO / Sentinel-2 L2A",
  "target_aoi": {
    "type": "${aoiInfo.type}",
    "area": "${aoiInfo.area}",
    "center": "${aoiInfo.centerFormatted}"${aoiInfo.nwFormatted ? `,
    "bounds": {
      "nw": "${aoiInfo.nwFormatted}",
      "se": "${aoiInfo.seFormatted}"
    }` : ''}
  },
  "features_detected": 142,
  "confidence_mean": 0.947,
  "projection": "EPSG:4326",
  "cloud_cover_pct": 1.8,
  "acquisition_date": "2024-03-12"
}` : `{
  "source": "ISRO / Sentinel-2 L2A",
  "aoi": "Mumbai, Maharashtra (19.0760 N, 72.8777 E)",
  "features_detected": 142,
  "confidence_mean": 0.947,
  "projection": "EPSG:4326",
  "cloud_cover_pct": 3.2,
  "timestamp": "2024-06-18T05:42:19Z"
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
