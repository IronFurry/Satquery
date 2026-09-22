import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Sparkles, Map, MessageSquare, Sun, Moon } from 'lucide-react';

export default function Header({ viewMode, setViewMode, theme, setTheme }) {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12)       setGreeting('Good morning');
    else if (h >= 12 && h < 17) setGreeting('Good afternoon');
    else                         setGreeting('Good evening');
  }, []);

  return (
    <header className="header">
      <div className="greeting-block">
        <div className="greeting-main">
          <span className="wave-emoji">👋</span>
          {greeting}, User &nbsp;
          <Sparkles size={14} className="header-sparkle-icon" />
        </div>
        <div className="greeting-sub">
          ISRO Earth Observation &nbsp;·&nbsp; Satellite Intelligence Platform &nbsp;·&nbsp;
          <span className="header-mission-badge">
            Live Mission Mode
          </span>
        </div>
      </div>

      {/* Mode Switcher: Map Console vs Centered AI Chat */}
      <div className="mode-toggle-group" role="tablist" aria-label="Interface View Mode">
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === 'console' ? 'active' : ''}`}
          onClick={() => setViewMode('console')}
          title="Map & Mission Console View"
        >
          <Map size={13} />
          <span>Map Console</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${viewMode === 'chat' ? 'active' : ''}`}
          onClick={() => setViewMode('chat')}
          title="Centered AI Chat View"
        >
          <MessageSquare size={13} />
          <span>AI Chat</span>
        </button>
      </div>

      <div className="header-right">
        {/* Theme Switcher: Dark (Proper Black) vs Light (Warm Instrument) */}
        <button
          type="button"
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Warm Instrument Light Theme' : 'Switch to Proper Black Dark Theme'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button type="button" className="notif-btn" title="Notifications">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>

        <div className="pfp-wrapper">
          <div className="pfp-avatar">U</div>
          <div>
            <div className="pfp-name">User</div>
            <div className="pfp-role">Lead Analyst · ISRO</div>
          </div>
          <ChevronDown size={13} className="pfp-chevron-icon" />
        </div>
      </div>
    </header>
  );
}
