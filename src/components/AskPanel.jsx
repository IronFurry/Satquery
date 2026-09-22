import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Mic, Send, UploadCloud, CornerDownLeft } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Count buildings',
  'Find water bodies',
  'Compare changes',
  'Describe this area',
  'Find roads',
  'Analyze vegetation'
];

function generateAoiPrompt(aoi) {
  if (!aoi) return 'Analyze this satellite imagery for key structures and changes.';
  if (aoi.type === 'box') {
    return `Analyze marked Box AOI [Area: ${aoi.area}, Center: ${aoi.centerFormatted}${aoi.nwFormatted ? `, Bounds: NW ${aoi.nwFormatted} · SE ${aoi.seFormatted}` : ''}]: Detect and count all structures, buildings, and land changes in this box.`;
  }
  if (aoi.type === 'circle') {
    return `Analyze marked Radius AOI [Area: ${aoi.area}, Center: ${aoi.centerFormatted}, Radius: ${aoi.radiusFormatted || ''}]: Detect and inspect all features in this circular zone.`;
  }
  return `Analyze marked Polygon AOI [Area: ${aoi.area}, Centroid: ${aoi.centerFormatted}, Vertices: ${aoi.vertexCount || 3} pts]: Detect all features inside this marked boundary.`;
}

export default function AskPanel({ onSendQuery, aoiInfo, injectedPrompt }) {
  const [prompt, setPrompt] = useState('How many buildings are present here?');
  const [analysisType, setAnalysisType] = useState('single');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  // Sync injected prompt from MapPanel AOI button
  useEffect(() => {
    if (injectedPrompt) {
      setPrompt(injectedPrompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [injectedPrompt]);

  const pills = aoiInfo?.area
    ? [`Analyze marked AOI (${aoiInfo.area})`, ...SUGGESTED_QUERIES]
    : SUGGESTED_QUERIES;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (prompt.trim() && onSendQuery) {
      onSendQuery(prompt);
    }
  };

  const handlePillClick = (q) => {
    if (q.startsWith('Analyze marked AOI') && aoiInfo) {
      const richPrompt = generateAoiPrompt(aoiInfo);
      setPrompt(richPrompt);
      if (onSendQuery) onSendQuery(richPrompt);
      return;
    }
    setPrompt(q);
    if (onSendQuery) onSendQuery(q);
  };

  const handlePasteAoi = () => {
    if (!aoiInfo) return;
    const text = generateAoiPrompt(aoiInfo);
    setPrompt(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="ask-satquery-card">
      {/* Left section: Q&A Prompt & Suggestions */}
      <div className="ask-prompt-section">
        <div className="ask-title-row">
          <div className="ask-sparkle-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="ask-heading">Ask SatQuery</h3>
            <p className="ask-subtext">Get answers, insights and visual evidence from satellite data.</p>
          </div>
        </div>

        {/* Attached AOI Banner if marked on map */}
        {aoiInfo?.area && (
          <div className="aoi-attached-banner">
            <div className="aoi-attached-left">
              <span className="aoi-attached-pulse" />
              <span className="aoi-attached-type">
                {aoiInfo.type === 'box' ? 'Box AOI' : aoiInfo.type === 'circle' ? 'Radius AOI' : 'Polygon AOI'}
              </span>
              <span className="aoi-attached-meta">
                {aoiInfo.area} · {aoiInfo.centerFormatted}
                {aoiInfo.nwFormatted && ` [Bounds: NW ${aoiInfo.nwFormatted} · SE ${aoiInfo.seFormatted}]`}
              </span>
            </div>
            <button
              type="button"
              className="aoi-paste-chip-btn"
              onClick={handlePasteAoi}
              title="Paste marked area coordinates into prompt"
            >
              <Sparkles size={11} />
              <span>Paste in chat</span>
            </button>
          </div>
        )}

        {/* Input box */}
        <form className="ask-input-box" onSubmit={handleSubmit}>
          <div className="ask-input-left-icon">
            <ImageIcon size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="ask-text-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask SatQuery anything about your imagery..."
          />
          <div className="ask-input-actions">
            <button
              type="button"
              className="ask-mic-btn"
              title="Voice query"
              aria-label="Voice input"
            >
              <Mic size={16} />
            </button>
            <button
              type="submit"
              className="ask-submit-btn"
              title="Submit query"
              aria-label="Submit query"
            >
              <Send size={15} />
            </button>
          </div>
        </form>

        {/* Try asking pills */}
        <div className="try-asking-row">
          <span className="try-asking-label">Try asking</span>
          <div className="try-asking-pills">
            {pills.map((q) => (
              <button
                key={q}
                type="button"
                className={`try-pill ${prompt === q ? 'active' : ''} ${q.startsWith('Analyze marked AOI') ? 'aoi-pill-accent' : ''}`}
                onClick={() => handlePillClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Upload Imagery & Analysis Type */}
      <div className="ask-upload-section">
        <div className="upload-header">
          <UploadCloud size={14} className="upload-header-icon" />
          <span>Upload Imagery</span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          <UploadCloud size={24} className="dropzone-cloud-icon" />
          <div className="dropzone-primary-text">Drop your satellite image here</div>
          <div className="dropzone-subtext">GeoTIFF · TIFF · PNG · JPEG</div>
        </div>

        {/* Analysis Type Radios */}
        <div className="analysis-type-container">
          <span className="analysis-type-title">Analysis Type</span>
          <div className="analysis-type-radios">
            {[
              { id: 'single', label: 'Single Image' },
              { id: 'two_dates', label: 'Two Dates' },
              { id: 'sar', label: 'Optical + SAR' },
            ].map(({ id, label }) => (
              <label
                key={id}
                className={`analysis-radio-item ${analysisType === id ? 'selected' : ''}`}
                onClick={() => setAnalysisType(id)}
              >
                <span className="radio-circle">
                  {analysisType === id && <span className="radio-dot" />}
                </span>
                <span className="radio-text">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
