'use client';

import React, { useState, useEffect } from 'react';
import RelationEditor from '@/components/RelationEditor';
import GraphVisualizer from '@/components/GraphVisualizer';
import JsonOutput from '@/components/JsonOutput';

const INITIAL_MOCKUP_INPUT = `# Define relationships: (Parent -> Child)

A -> B
B -> C, D, E

X -> Y
Y -> Z
W -> V

# Circular Dependency Error Example:
M -> N
N -> M`;

export default function Home() {
  const [inputText, setInputText] = useState(INITIAL_MOCKUP_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Stats derived from results
  const [stats, setStats] = useState({
    totalNodes: 0,
    activeTrees: 0,
    totalRelations: 0,
    errorsDetected: '0',
  });

  // Automatically submit initial layout on load
  useEffect(() => {
    processData(INITIAL_MOCKUP_INPUT);
  }, []);

  const convertShorthandToEdges = (text) => {
    const lines = text.split('\n');
    const result = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // skip empty and comments

      // Split on -> with any spacing
      const parts = trimmed.split(/-\s*>/);
      if (parts.length === 2) {
        const parent = parts[0].trim();
        const childrenRaw = parts[1].trim();

        // Split children by comma
        const children = childrenRaw
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

        children.forEach((child) => {
          result.push(`${parent}->${child}`);
        });
      } else {
        // Pass invalid formatted lines as-is to let the API register format errors
        result.push(trimmed);
      }
    });

    return result;
  };

  const processData = async (textToProcess) => {
    setLoading(true);
    setError(null);

    const edges = convertShorthandToEdges(textToProcess);

    if (edges.length === 0) {
      setError('Please enter some relations to build.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: edges }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to build graph.');
      }

      setResults(data);

      // Compute stats
      const nodeSet = new Set();
      edges.forEach((edge) => {
        const parts = edge.split('->');
        if (parts.length === 2) {
          const from = parts[0].trim();
          const to = parts[1].trim();
          if (from.match(/^[A-Z]$/)) nodeSet.add(from);
          if (to.match(/^[A-Z]$/)) nodeSet.add(to);
        }
      });

      const totalNodes = nodeSet.size;
      const activeTrees = data.summary?.total_trees || 0;
      const totalRelations = edges.filter((e) => e.includes('->')).length;
      
      const invalidCount = data.invalid_entries?.length || 0;
      const cycleCount = data.summary?.total_cycles || 0;
      let errorsDetected = '0';
      if (cycleCount > 0 && invalidCount > 0) {
        errorsDetected = `${invalidCount + cycleCount} (${cycleCount} Circ)`;
      } else if (cycleCount > 0) {
        errorsDetected = `${cycleCount} (Circular)`;
      } else if (invalidCount > 0) {
        errorsDetected = `${invalidCount} (Format)`;
      }

      setStats({
        totalNodes,
        activeTrees,
        totalRelations,
        errorsDetected,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = () => {
    processData(inputText);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-foreground flex flex-col">
      {/* Top Banner Header */}
      <header className="px-8 py-5 border-b border-border bg-[#0a0a0f]/60 backdrop-blur-md sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple text-lg shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            🌿
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider uppercase text-foreground leading-none">
              BFHL Tree Hierarchy Builder
            </h1>
            <p className="text-[10px] text-foreground/45 mt-1 font-mono">
              26BCE1001 • Eash Mahajan • eashita@college.edu
            </p>
          </div>
        </div>

        {/* Live Indicator Status */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse-glow" />
          <span>Production Build Live</span>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-6 overflow-y-auto">
        {/* Stat Cards Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Nodes */}
          <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.01)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
              Total Nodes
            </span>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {stats.totalNodes}
            </div>
          </div>

          {/* Active Trees */}
          <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.01)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
              Active Trees
            </span>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {stats.activeTrees}
            </div>
          </div>

          {/* Total Relations */}
          <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.01)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
              Total Relations
            </span>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {stats.totalRelations}
            </div>
          </div>

          {/* Errors Detected */}
          <div className={`p-5 rounded-2xl border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.01)] ${
            stats.errorsDetected !== '0' ? 'border-accent-rose/30 text-accent-rose' : 'border-border'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
              Errors Detected
            </span>
            <div className="text-2xl font-bold tracking-tight font-mono">
              {stats.errorsDetected}
            </div>
          </div>
        </section>

        {/* Workspace Panels Grid (Editor side-by-side with Visualizer for equal heights) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: RELATIONSHIP EDITOR */}
          <div className="h-[600px] min-h-[500px]">
            <RelationEditor
              value={inputText}
              onChange={setInputText}
              onValidate={handleValidate}
              loading={loading}
            />
          </div>

          {/* Right: HIERARCHY VIEW */}
          <div className="h-[600px] min-h-[500px]">
            <GraphVisualizer hierarchies={results?.hierarchies} />
          </div>
        </section>

        {/* Bottom Full-Width Section: OUTPUT (JSON VIEW) */}
        <section className="w-full">
          <JsonOutput data={results} />
        </section>
      </div>

      {/* Footer Banner */}
      <footer className="py-6 border-t border-border/50 text-center text-[10px] text-foreground/30 font-mono shrink-0">
        BFHL Assessment Solution • Built with Next.js 15, Tailwind CSS, & Vercel
      </footer>
    </div>
  );
}
