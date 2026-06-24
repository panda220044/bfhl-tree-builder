'use client';

import React, { useRef, useEffect } from 'react';

export default function RelationEditor({ value = '', onChange, onValidate, loading }) {
  const textareaRef = useRef(null);
  const backdropRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Sync scroll of lines and backdrop pre-element with textarea
  const handleScroll = () => {
    if (textareaRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop;
      if (backdropRef.current) backdropRef.current.scrollTop = scrollTop;
    }
  };

  // Trigger validate on Ctrl + Enter key combination
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (onValidate) onValidate();
    }
  };

  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 25) }, (_, i) => i + 1);

  // Parse code for styling
  const highlightSyntax = (text) => {
    if (!text) return '';

    // Escape HTML symbols
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Format Comments (#...) in grey-italic
    html = html.replace(/(#.*)/g, '<span class="text-foreground/30 italic">$1</span>');

    // Format Arrows (->) in purple
    html = html.replace(/-&gt;/g, '<span class="text-accent-purple font-bold">-&gt;</span>');

    // Format Commas (,) in amber
    html = html.replace(/,/g, '<span class="text-accent-amber font-bold">,</span>');

    // Format Nodes (uppercase characters A-Z) in neon cyan
    html = html.replace(/\b([A-Z])\b/g, '<span class="text-accent-cyan font-bold">$1</span>');

    return html;
  };

  return (
    <div className="flex flex-col h-full bg-[#12121a]/30 border border-border/80 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-white/10">
      {/* Editor Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-surface-primary/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-purple animate-pulse-glow" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              RELATIONSHIP EDITOR
            </h3>
          </div>
          <p className="text-[10px] text-foreground/45 mt-0.5">
            Define hierarchy nodes & edge paths.
          </p>
        </div>
        <div className="flex space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-accent-rose/20 border border-accent-rose/40" />
          <span className="w-3 h-3 rounded-full bg-accent-amber/20 border border-accent-amber/40" />
          <span className="w-3 h-3 rounded-full bg-accent-emerald/20 border border-accent-emerald/40" />
        </div>
      </div>

      {/* Toolbar Menu */}
      <div className="px-5 py-2.5 border-b border-border/40 bg-surface-primary/30 flex items-center space-x-4 text-[11px] font-medium text-foreground/60 select-none">
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>File</span>
          <span className="text-[8px] opacity-60">▼</span>
        </button>
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>Save</span>
          <span className="text-[8px] opacity-60">▼</span>
        </button>
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>Undo</span>
          <span className="text-[8px] opacity-60">▼</span>
        </button>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden font-mono text-sm leading-6 relative bg-surface-primary/5">
        {/* Line Numbers Left Panel */}
        <div
          ref={lineNumbersRef}
          className="w-12 select-none text-right pr-4 text-foreground/20 border-r border-border/20 py-4 bg-[#0a0a0f]/20 overflow-hidden"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="h-6">
              {num}
            </div>
          ))}
        </div>

        {/* Editor Container (Overlay text and pre block) */}
        <div className="flex-1 relative h-full overflow-hidden">
          {/* Syntax Highlighted Backdrop View */}
          <div
            ref={backdropRef}
            className="absolute inset-0 px-5 py-4 pointer-events-none overflow-hidden select-none whitespace-pre leading-6 text-foreground/90 font-mono"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
            dangerouslySetInnerHTML={{ __html: highlightSyntax(value) }}
          />

          {/* Raw Text Input overlay (completely transparent text) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none resize-none px-5 py-4 text-transparent caret-white focus:ring-0 leading-6 overflow-y-auto font-mono selection:bg-accent-purple/35 selection:text-white"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
            placeholder={`# Define relationships (Parent -> Child)\nA -> B\nB -> C, D`}
          />
        </div>
      </div>

      {/* Footer bar with Build Trees validate trigger */}
      <div className="px-5 py-4 border-t border-border bg-[#0a0a0f]/40 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-foreground/35 font-mono">
          Press <kbd className="bg-surface-secondary px-1.5 py-0.5 rounded border border-border">Ctrl + Enter</kbd> to run
        </span>

        <button
          type="button"
          onClick={onValidate}
          disabled={loading}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white transition shadow-lg shadow-accent-purple/20 flex items-center space-x-2 border border-accent-purple/40"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Building...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Build Trees</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
