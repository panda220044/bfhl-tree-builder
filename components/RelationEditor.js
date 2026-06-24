'use client';

import React, { useRef, useEffect } from 'react';

export default function RelationEditor({ value = '', onChange, onValidate, loading }) {
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 28) }, (_, i) => i + 1);

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Sync scroll of line numbers with text area scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-secondary/40 border border-border rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Editor Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              RELATIONSHIP EDITOR
            </h3>
            <span className="text-foreground/30 text-xs">⚙️</span>
          </div>
          <p className="text-[10px] text-foreground/45 mt-0.5">
            Edit a robust. Tree hierarchy Builder.
          </p>
        </div>
      </div>

      {/* Editor File Toolbar */}
      <div className="px-4 py-2 border-b border-border/40 bg-surface-primary/40 flex items-center space-x-4 text-[11px] text-foreground/60">
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>File</span>
          <span className="text-[8px]">▼</span>
        </button>
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>Save</span>
          <span className="text-[8px]">▼</span>
        </button>
        <button className="hover:text-foreground transition flex items-center space-x-1">
          <span>Undo</span>
          <span className="text-[8px]">▼</span>
        </button>
      </div>

      {/* Editor Main Text Area Container */}
      <div className="flex-1 flex overflow-hidden font-mono text-sm leading-6 relative bg-surface-primary/20">
        {/* Line Numbers Left Panel */}
        <div
          ref={lineNumbersRef}
          className="w-12 select-none text-right pr-3 text-foreground/20 border-r border-border/30 py-3 bg-surface-primary/10 overflow-hidden"
        >
          {lineNumbers.map((num) => (
            <div key={num} className="h-6">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck="false"
          className="flex-1 h-full bg-transparent border-none outline-none resize-none px-4 py-3 text-accent-cyan/95 focus:ring-0 leading-6 overflow-y-auto"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
          placeholder={`# Define relationships (Parent -> Child)\nA -> B\nB -> C, D`}
        />
      </div>
    </div>
  );
}
