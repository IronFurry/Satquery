import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';

export default function Header() {
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
          {greeting}, Aryan &nbsp;
          <Sparkles size={15} style={{ color: 'var(--cyan)', opacity: 0.9 }} />
        </div>
        <div className="greeting-sub">
          ISRO Earth Observation &nbsp;·&nbsp; Satellite Intelligence Platform &nbsp;·&nbsp;
          <span style={{ color: 'var(--isro-orange-lt)', fontWeight: 600 }}>
            Live Mission Mode
          </span>
        </div>
      </div>

      <div className="header-right">
        <button className="notif-btn" title="Notifications">
          <Bell size={16} />
          <span className="notif-dot" />
        </button>

        <div className="pfp-wrapper">
          <div className="pfp-avatar">A</div>
          <div>
            <div className="pfp-name">Aryan</div>
            <div className="pfp-role">Lead Analyst · ISRO</div>
          </div>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  );
}
