'use client';

import React, { useState } from 'react';

export default function JsonOutput({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bfhl-hierarchy-${data.summary?.largest_tree_root || 'output'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonString = data ? JSON.stringify(data, null, 2) : '{\n  // Awaiting relations parsing...\n}';

  return (
    <div className="flex flex-col h-full bg-[#12121a]/30 border border-border rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          OUTPUT (JSON VIEW)
        </h3>
        <div className="flex items-center space-x-2">
          {/* Copy Icon Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-surface-hover hover:bg-white/10 border border-border transition text-foreground/75 hover:text-foreground text-xs"
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : '📋'}
          </button>
          {/* Export JSON Button */}
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded bg-surface-hover hover:bg-white/10 border border-border text-[11px] font-semibold text-foreground/80 hover:text-foreground transition flex items-center space-x-1"
          >
            <span>📤</span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* JSON Content Pre-block */}
      <div className="flex-1 bg-surface-primary/10 rounded-xl overflow-hidden border border-border/30 font-mono text-xs relative">
        <pre className="h-full w-full p-4 overflow-y-auto text-accent-cyan/90 leading-relaxed max-h-56">
          <code
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {jsonString}
          </code>
        </pre>
      </div>
    </div>
  );
}
