'use client';

import React from 'react';

export default function Sidebar({ activeTab = 'Builder', setActiveTab }) {
  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Builder', icon: '⚡' },
    { name: 'Library', icon: '📚' },
    { name: 'Errors', icon: '⚠️' },
    { name: 'Docs', icon: '📄' },
    { name: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0f] border-r border-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* Title / Logo */}
      <div className="p-6 border-b border-border flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple flex items-center justify-center text-accent-purple text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          🌿
        </div>
        <span className="font-bold text-xs uppercase tracking-wider text-foreground leading-tight">
          BFHL Tree<br />Hierarchy Builder
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = item.name === activeTab;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab && setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.08)]'
                  : 'text-foreground/50 hover:text-foreground hover:bg-surface-hover border border-transparent'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center text-white text-xs font-bold font-mono">
            EM
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Eash Mahajan</div>
            <div className="text-[10px] text-foreground/40 font-mono">26BCE1001</div>
          </div>
        </div>
        <span className="text-foreground/30 text-xs">▼</span>
      </div>
    </aside>
  );
}
