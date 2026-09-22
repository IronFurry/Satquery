import React, { useState } from 'react';
import {
  Sparkles, Image as ImageIcon, Mic, Send, UploadCloud,
  Building2, Target, Lightbulb, MapPin, ArrowRight, Download, CheckCircle2,
  FileCheck, Compass, Layers, Globe
} from 'lucide-react';

const EXPLORE_SUGGESTIONS = [
  {
    icon: <Building2 size={15} />,
    title: 'Building footprint extraction',
    query: 'How many buildings are present in this Mumbai AOI?',
    desc: 'Run SAM-Geospatial structure detection over South Mumbai'
  },
  {
    icon: <MapPin size={15} />,
    title: 'Surface water delineation',
    query: 'Extract water bodies and coastal boundaries',
    desc: 'Detect seasonal water extent and coastal waterlines'
  },
  {
    icon: <Target size={15} />,
    title: 'Two-date change detection',
    query: 'Compare two acquisition dates for urban expansion',
    desc: 'Analyze multi-temporal optical imagery for newly developed land'
  },
  {
    icon: <Layers size={15} />,
    title: 'Vegetation canopy & NDVI',
    query: 'Analyze vegetation health and calculate NDVI index',
    desc: 'Extract agricultural and green canopy vigor from NIR bands'
  }
];

export default function CenteredChatView({ onSwitchToMap, aoiInfo, injectedPrompt }) {
  const [input, setInput] = useState(injectedPrompt || '');
  const [analysisType, setAnalysisType] = useState('single');
  // Starts with NO query, exactly like ChatGPT/Gemini
  const [messages, setMessages] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);

  React.useEffect(() => {
    if (injectedPrompt) {
      setInput(injectedPrompt);
    }
  }, [injectedPrompt]);

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query
    };

    const aiMsg = {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      findings: {
        count: 142,
        confidence: '94.7%',
        aoi: 'Mumbai, Maharashtra (19.0760° N, 72.8777° E)',
        summary: `Analysis complete for: "${query}". Processed Sentinel-2 L2A multispectral data with SAM-Geospatial deep learning pipeline.`,
        insights: [
          'High density detected in the central commercial district (94.7% confidence).',
          'Spectral signatures match reinforced concrete and built surfaces with negligible cloud interference (3.2%).',
          'GeoJSON vector boundaries and shapefile outputs are ready for telemetry export.'
        ]
      }
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setAttachedFile(null);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachedFile(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="centered-chat-container">
      {messages.length === 0 ? (
        /* ─── INITIAL STATE: Pure ChatGPT / Gemini Style in the exact center ─── */
        <div className="chat-hero-centered">
          {/* Brand & Greeting */}
          <div className="chat-hero-header">
            <div className="chat-hero-icon">
              <Globe size={26} />
            </div>
            <h1 className="chat-hero-title">Where would you like to explore today, User?</h1>
            <p className="chat-hero-subtitle">
              ISRO Earth Observation & Geospatial Intelligence Console
            </p>
          </div>

          {/* ChatGPT / Gemini Style Centered Prompt Box */}
          <div className="chat-hero-input-wrap">
            {attachedFile && (
              <div className="attached-file-pill">
                <FileCheck size={13} className="icon-cyan" />
                <span>{attachedFile}</span>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => setAttachedFile(null)}
                >
                  ×
                </button>
              </div>
            )}

            {aoiInfo?.area && (
              <div className="aoi-attached-banner" style={{ maxWidth: '640px', width: '100%', marginBottom: '8px' }}>
                <div className="aoi-attached-left">
                  <span className="aoi-attached-pulse" />
                  <span className="aoi-attached-type">
                    {aoiInfo.type === 'box' ? 'Box AOI' : aoiInfo.type === 'circle' ? 'Radius AOI' : 'Polygon AOI'}
                  </span>
                  <span className="aoi-attached-meta">
                    {aoiInfo.area} · {aoiInfo.centerFormatted}
                    {aoiInfo.nwFormatted && ` [NW ${aoiInfo.nwFormatted} · SE ${aoiInfo.seFormatted}]`}
                  </span>
                </div>
                <button
                  type="button"
                  className="aoi-paste-chip-btn"
                  onClick={() => {
                    const queryText = aoiInfo.type === 'box'
                      ? `Analyze marked Box AOI [Area: ${aoiInfo.area}, Center: ${aoiInfo.centerFormatted}${aoiInfo.nwFormatted ? `, Bounds: NW ${aoiInfo.nwFormatted} · SE ${aoiInfo.seFormatted}` : ''}]: Detect and count all structures, buildings, and land changes in this box.`
                      : `Analyze marked AOI [Area: ${aoiInfo.area}, Center: ${aoiInfo.centerFormatted}]: Detect features and structures in this zone.`;
                    setInput(queryText);
                  }}
                  title="Insert marked box coordinates into query"
                >
                  <Sparkles size={11} />
                  <span>Insert in chat</span>
                </button>
              </div>
            )}

            <form
              className="centered-prompt-box hero-style"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <div className="prompt-input-row">
                <input
                  type="text"
                  className="centered-text-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask SatQuery anything about satellite imagery, coordinates, or object detection..."
                  autoFocus
                />
              </div>

              <div className="prompt-controls-row">
                <div className="prompt-controls-left">
                  {/* Image / GeoTIFF Upload Button */}
                  <label className="prompt-icon-btn" title="Upload GeoTIFF, TIFF, PNG, or JPEG">
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFile(e.target.files[0].name);
                        }
                      }}
                    />
                    <UploadCloud size={15} />
                    <span className="btn-label-text">Attach Imagery</span>
                  </label>

                  {/* Analysis Type Selector */}
                  <div className="prompt-analysis-pills">
                    {[
                      { id: 'single', label: 'Single Image' },
                      { id: 'two_dates', label: 'Two Dates' },
                      { id: 'sar', label: 'Optical + SAR' },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        className={`analysis-chip ${analysisType === id ? 'active' : ''}`}
                        onClick={() => setAnalysisType(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="prompt-controls-right">
                  <button
                    type="button"
                    className="prompt-icon-btn round"
                    title="Voice input"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="submit"
                    className="prompt-send-circle-btn"
                    title="Send query"
                    disabled={!input.trim() && !attachedFile}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Professional "Wanna Explore Together" section */}
          <div className="explore-together-section">
            <div className="explore-together-header">
              <Compass size={14} className="icon-cyan" />
              <span>Ready to explore satellite data together? Select a mission starter:</span>
            </div>

            <div className="explore-together-grid">
              {EXPLORE_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="explore-starter-card"
                  onClick={() => handleSend(item.query)}
                >
                  <div className="starter-icon">{item.icon}</div>
                  <div className="starter-body">
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                  <ArrowRight size={13} className="starter-arrow" />
                </button>
              ))}
            </div>

            <div className="chat-hero-footer-note">
              <span>🇮🇳 Indian Space Research Organisation · Earth Observation Applications · Sentinel-2 & Cartosat</span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── CONVERSATION ACTIVE STATE: Thread + Bottom Input Bar ─── */
        <>
          <div className="chat-thread-scroll">
            <div className="chat-messages-wrap">
              <div className="chat-mission-banner">
                <Sparkles size={14} className="icon-cyan" />
                <span>ISRO Earth Observation Analytical Session · Live Analysis</span>
                {onSwitchToMap && (
                  <button type="button" className="btn-inline-map" onClick={onSwitchToMap}>
                    Inspect on Interactive Map →
                  </button>
                )}
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`chat-message-row ${m.sender === 'user' ? 'user-row' : 'ai-row'}`}
                >
                  {m.sender === 'user' ? (
                    <div className="user-message-bubble">
                      <p>{m.text}</p>
                    </div>
                  ) : (
                    <div className="ai-message-card">
                      <div className="ai-message-header">
                        <div className="ai-message-badge">
                          <Sparkles size={14} />
                          <span>SatQuery Intelligence</span>
                        </div>
                        <span className="badge-green">Confidence {m.findings.confidence}</span>
                      </div>

                      <p className="ai-message-summary">{m.findings.summary}</p>

                      {/* Stats & Visual Evidence Row */}
                      <div className="ai-evidence-split">
                        <div className="ai-evidence-thumb-box">
                          <img
                            src="/mumbai_satellite.jpg"
                            alt="Satellite Evidence"
                            className="ai-evidence-img"
                          />
                          <div className="ai-evidence-tag">Sentinel-2 L2A Crop</div>
                        </div>

                        <div className="ai-stats-column">
                          <div className="ai-stat-item">
                            <Building2 size={16} className="icon-cyan" />
                            <div>
                              <div className="ai-stat-number">{m.findings.count}</div>
                              <div className="ai-stat-label">Detected Buildings</div>
                            </div>
                          </div>
                          <div className="ai-stat-item">
                            <Target size={16} className="icon-cyan" />
                            <div>
                              <div className="ai-stat-number">{m.findings.confidence}</div>
                              <div className="ai-stat-label">Model Precision</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights List */}
                      <div className="ai-insights-block">
                        <div className="ai-insights-title">
                          <Lightbulb size={14} className="icon-orange" />
                          <span>Key Analytical Insights</span>
                        </div>
                        <ul className="ai-insights-items">
                          {m.findings.insights.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Bar */}
                      <div className="ai-actions-row">
                        <button type="button" className="btn-chat-action">
                          <Download size={13} />
                          <span>Download ISRO Report</span>
                        </button>
                        {onSwitchToMap && (
                          <button
                            type="button"
                            className="btn-chat-action primary"
                            onClick={onSwitchToMap}
                          >
                            <ArrowRight size={13} />
                            <span>Inspect on Map Console</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-chat-action"
                          onClick={() => setMessages([])}
                          title="Clear conversation"
                        >
                          New Session
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Docked Input Bar when conversation is ongoing */}
          <div className="centered-input-wrapper">
            {attachedFile && (
              <div className="attached-file-pill">
                <FileCheck size={13} className="icon-cyan" />
                <span>{attachedFile}</span>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => setAttachedFile(null)}
                >
                  ×
                </button>
              </div>
            )}

            <form
              className="centered-prompt-box"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <div className="prompt-input-row">
                <input
                  type="text"
                  className="centered-text-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a follow-up or provide a new satellite AOI query..."
                />
              </div>

              <div className="prompt-controls-row">
                <div className="prompt-controls-left">
                  <label className="prompt-icon-btn" title="Upload GeoTIFF, TIFF, PNG, or JPEG">
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFile(e.target.files[0].name);
                        }
                      }}
                    />
                    <UploadCloud size={15} />
                    <span className="btn-label-text">Attach Imagery</span>
                  </label>

                  <div className="prompt-analysis-pills">
                    {[
                      { id: 'single', label: 'Single Image' },
                      { id: 'two_dates', label: 'Two Dates' },
                      { id: 'sar', label: 'Optical + SAR' },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        className={`analysis-chip ${analysisType === id ? 'active' : ''}`}
                        onClick={() => setAnalysisType(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="prompt-controls-right">
                  <button
                    type="button"
                    className="prompt-icon-btn round"
                    title="Voice input"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="submit"
                    className="prompt-send-circle-btn"
                    title="Send query"
                    disabled={!input.trim() && !attachedFile}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </form>

            <div className="centered-input-footnote">
              SatQuery leverages ISRO Earth Observation models and Sentinel-2 multispectral pipeline. Verify critical mission coordinates.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
