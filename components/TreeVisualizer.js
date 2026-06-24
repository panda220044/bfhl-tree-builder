'use client';

import React, { useState } from 'react';

/**
 * Renders a single node and its children recursively as an interactive tree directory.
 */
function TreeNode({ name, children, isRoot = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const childKeys = Object.keys(children || {});
  const hasChildren = childKeys.length > 0;

  return (
    <div className="pl-4 border-l border-border/40 my-1 relative">
      {/* Node connector line indicator */}
      {!isRoot && (
        <div className="absolute left-0 top-3.5 w-3.5 border-t border-border/40" />
      )}

      <div className="flex items-center space-x-2 py-1 group">
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-5 h-5 flex items-center justify-center rounded bg-surface-hover border border-border/60 hover:border-accent-purple/50 text-xs transition"
          >
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/80" />
          </div>
        )}

        <div className={`px-2.5 py-0.5 rounded text-sm font-semibold font-mono border transition ${
          isRoot 
            ? 'bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_12px_rgba(139,92,246,0.15)]' 
            : 'bg-surface-secondary/80 border-border text-foreground hover:border-accent-cyan/40'
        }`}>
          {name}
        </div>

        {hasChildren && (
          <span className="text-[10px] text-foreground/40 font-mono">
            ({childKeys.length} {childKeys.length === 1 ? 'child' : 'children'})
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1 ml-2.5">
          {childKeys.map((childName) => (
            <TreeNode
              key={childName}
              name={childName}
              children={children[childName]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeVisualizer({ hierarchies = [] }) {
  if (!hierarchies || hierarchies.length === 0) {
    return (
      <div className="text-center py-8 text-foreground/40 text-sm">
        No hierarchies to display. Submit data to generate hierarchies.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hierarchies.map((hierarchy, index) => {
        const { root, tree, has_cycle, depth } = hierarchy;

        return (
          <div
            key={index}
            className="p-5 rounded-xl border border-border bg-surface-secondary/30 relative overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Ambient decorative glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-[0.03] pointer-events-none rounded-full ${
              has_cycle ? 'bg-accent-rose' : 'bg-accent-purple'
            }`} />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider font-mono bg-surface-hover border border-border">
                  {has_cycle ? 'Pure Cycle' : `Tree ${index + 1}`}
                </span>
                <span className="text-sm font-medium text-foreground/75">
                  Root: <strong className="font-mono text-foreground font-semibold">{root}</strong>
                </span>
              </div>
              
              {!has_cycle && typeof depth === 'number' && (
                <div className="text-xs text-foreground/50 font-mono">
                  Depth: <span className="text-accent-cyan font-semibold">{depth}</span>
                </div>
              )}

              {has_cycle && (
                <span className="text-xs text-accent-rose font-mono font-semibold flex items-center space-x-1">
                  <span>⚠️ Loop / Cycle detected</span>
                </span>
              )}
            </div>

            {has_cycle ? (
              <div className="p-4 rounded-lg bg-accent-rose/5 border border-accent-rose/20 text-sm text-foreground/80">
                <p className="mb-2">
                  This connected component contains a cycle and no natural root. 
                  Lexicographically smallest node <code className="px-1.5 py-0.5 bg-accent-rose/10 text-accent-rose rounded font-mono font-bold">{root}</code> was designated as root.
                </p>
                <div className="text-xs font-mono opacity-60">
                  Cycle parameters: has_cycle = true, tree = &#123;&#125;
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto py-2">
                {tree[root] ? (
                  <TreeNode name={root} children={tree[root]} isRoot={true} />
                ) : (
                  <div className="pl-4">
                    <TreeNode name={root} children={{}} isRoot={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
