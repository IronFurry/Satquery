import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Mic, Send } from 'lucide-react';

const PILLS = ['Count buildings', 'Find water bodies', 'Compare changes', 'Find roads', 'Analyze vegetation'];
const ANALYSIS_TYPES = [
  { id: 'single',    label: 'Single Image' },
  { id: 'two_dates', label: 'Two Dates' },
  { id: 'sar',       label: 'Optical + SAR' },
];

export default function AskStrip({ onSendQuery }) {
  const [prompt, setPrompt]   = useState('');
  const [atype, setAtype]     = useState('single');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) { onSendQuery(prompt); setPrompt(''); }
  };

  return (
    <div className="ask-strip">
      {/* Label */}
      <div className="ask-label-block">
        <div className="ask-icon-badge">
          <Sparkles size={16} />
        </div>
        <div className="ask-label-text">
          <strong>Ask SatQuery</strong>
          <span>Satellite intelligence Q&A</span>
        </div>
      </div>

      <div className="ask-divider" />

      {/* Prompt Input */}
      <form className="ask-form" onSubmit={handleSubmit}>
        <ImageIcon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          className="ask-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="How many buildings are present here?"
        />
        <button type="button" className="mic-btn-ask" title="Voice input">
          <Mic size={16} />
        </button>
        <button type="submit" className="ask-send-btn" title="Submit query">
          <Send size={14} />
        </button>
      </form>

      <div className="ask-divider" />

      {/* Quick Pills */}
      <div className="ask-pills-section">
        {PILLS.map(p => (
          <button key={p} className="ask-pill" onClick={() => setPrompt(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="ask-divider" />

      {/* Analysis Type */}
      <div className="ask-analysis-type">
        {ANALYSIS_TYPES.map(({ id, label }) => (
          <div
            key={id}
            className={`radio-opt ${atype === id ? 'sel' : ''}`}
            onClick={() => setAtype(id)}
          >
            <div className="radio-ring">
              {atype === id && <div className="radio-inner" />}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
