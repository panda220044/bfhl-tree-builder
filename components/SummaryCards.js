'use client';

import React from 'react';

export default function SummaryCards({ summary = {} }) {
  const { total_trees = 0, total_cycles = 0, largest_tree_root = null } = summary;

  const cards = [
    {
      title: 'Total Trees',
      value: total_trees,
      description: 'Connected components with a natural root',
      color: 'border-accent-purple/30 text-accent-purple shadow-accent-purple/5',
      glow: 'bg-accent-purple/5',
    },
    {
      title: 'Total Cycles',
      value: total_cycles,
      description: 'Connected components with loops & no root',
      color: 'border-accent-rose/30 text-accent-rose shadow-accent-rose/5',
      glow: 'bg-accent-rose/5',
    },
    {
      title: 'Largest Tree Root',
      value: largest_tree_root || 'N/A',
      description: 'Root with the maximum depth (tie-breaker: A-Z)',
      color: 'border-accent-cyan/30 text-accent-cyan shadow-accent-cyan/5',
      glow: 'bg-accent-cyan/5',
      fontMono: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-xl border bg-surface-secondary/40 relative overflow-hidden transition hover:scale-[1.01] hover:border-white/10 ${card.color}`}
        >
          {/* Card Ambient Glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 blur-2xl rounded-full ${card.glow}`} />
          
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50 block mb-1">
            {card.title}
          </span>
          
          <div className={`text-3xl font-bold tracking-tight mb-2 ${card.fontMono ? 'font-mono' : ''}`}>
            {card.value}
          </div>
          
          <p className="text-xs text-foreground/45 leading-relaxed">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
