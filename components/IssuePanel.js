'use client';

import React from 'react';

export default function IssuePanel({ invalidEntries = [], duplicateEdges = [] }) {
  const hasIssues = invalidEntries.length > 0 || duplicateEdges.length > 0;

  if (!hasIssues) {
    return (
      <div className="p-5 rounded-xl border border-border/40 bg-surface-secondary/20 text-center text-sm text-foreground/40">
        ✨ No invalid entries or duplicate edges detected. All inputs are clean!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Invalid Entries Section */}
      <div className="p-5 rounded-xl border border-accent-rose/25 bg-accent-rose/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide uppercase text-accent-rose">
            Invalid Entries ({invalidEntries.length})
          </h3>
          <span className="text-[10px] bg-accent-rose/10 text-accent-rose px-2 py-0.5 rounded font-semibold font-mono border border-accent-rose/20">
            Rejected
          </span>
        </div>
        
        {invalidEntries.length === 0 ? (
          <p className="text-xs text-foreground/50">No invalid entries detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {invalidEntries.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-accent-rose/10 border border-accent-rose/30 text-accent-rose font-mono text-xs hover:bg-accent-rose/25 transition cursor-default"
                title="Failed format rule: Must be X->Y, uppercase letters, no self-loops, and non-empty."
              >
                {item === '' ? <span className="italic text-xs opacity-50">&lt;empty&gt;</span> : item}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-foreground/45 mt-3 leading-relaxed">
          Must match <code className="font-mono text-accent-rose">X-&gt;Y</code> where X and Y are uppercase letters, and X ≠ Y.
        </p>
      </div>

      {/* Duplicate Edges Section */}
      <div className="p-5 rounded-xl border border-accent-amber/25 bg-accent-amber/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide uppercase text-accent-amber">
            Duplicate Edges ({duplicateEdges.length})
          </h3>
          <span className="text-[10px] bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded font-semibold font-mono border border-accent-amber/20">
            Deduplicated
          </span>
        </div>

        {duplicateEdges.length === 0 ? (
          <p className="text-xs text-foreground/50">No duplicate edges found.</p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {duplicateEdges.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-accent-amber/10 border border-accent-amber/30 text-accent-amber font-mono text-xs hover:bg-accent-amber/25 transition cursor-default"
                title="First occurrence of this relation was kept; subsequent duplicates are listed here."
              >
                {item}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-foreground/45 mt-3 leading-relaxed">
          First occurrence used. Subsequent identical edges are shown here and ignored.
        </p>
      </div>
    </div>
  );
}
