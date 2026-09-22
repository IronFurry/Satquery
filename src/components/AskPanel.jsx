import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Mic, Send, UploadCloud } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Count buildings',
  'Find water bodies',
  'Compare changes',
  'Describe this area',
  'Find roads',
  'Analyze vegetation'
];

export default function AskPanel({ onSendQuery }) {
  const [prompt, setPrompt] = useState('How many buildings are present here?');
  const [analysisType, setAnalysisType] = useState('single');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (prompt.trim() && onSendQuery) {
      onSendQuery(prompt);
    }
  };

  const handlePillClick = (q) => {
    setPrompt(q);
    if (onSendQuery) onSendQuery(q);
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

        {/* Input box */}
        <form className="ask-input-box" onSubmit={handleSubmit}>
          <div className="ask-input-left-icon">
            <ImageIcon size={18} />
          </div>
          <input
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
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                className={`try-pill ${prompt === q ? 'active' : ''}`}
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
