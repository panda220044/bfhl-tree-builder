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
        errorsDetected = `${invalidCount + cycleCount} (Circular)`;
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
    <div className="min-h-screen w-full bg-[#0a0a0f] text-foreground flex flex-col font-sans select-none">
      {/* Top Header matching mockup precisely (Dashboard title, controls, profile) */}
      <header className="px-8 py-4 border-b border-border bg-[#0a0a0f]/40 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
        </div>

        {/* Header Controls (Tooltip refresh and build trees) */}
        <div className="flex items-center space-x-3">
          <div className="text-xs text-foreground/40 font-mono hidden md:block">
            Tooltips:
          </div>
          <button className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-secondary border border-border hover:bg-surface-hover text-foreground/80 flex items-center space-x-2 transition">
            <span>Refresh View</span>
            <span className="text-[8px] opacity-60">▼</span>
          </button>

          <button
            onClick={handleValidate}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-surface-secondary border border-border hover:bg-surface-hover text-foreground flex items-center space-x-2 transition"
          >
            <span>Build Trees</span>
            <span className="text-[8px] opacity-60">▼</span>
          </button>

          {/* Profile Circle Avatar matching mockup */}
          <div className="flex items-center space-x-2 border-l border-border pl-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-blue border border-white/10 flex items-center justify-center text-white text-[10px] font-bold font-mono">
              Logo
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex items-center justify-center bg-surface-secondary">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-foreground/30 text-[10px]">▼</span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 space-y-6 overflow-y-auto">
        
        {/* Main Grid: Split Layout precisely mapping the columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN (Editor description + Code Editor) — spans 5 of 12 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Relationship Editor Description Card */}
            <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm h-[100px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    RELATIONSHIP EDITOR
                  </h2>
                  <p className="text-[10px] text-foreground/45 mt-1 font-mono">
                    Edit a robust. Tree hierarchy Builder.
                  </p>
                </div>
                <span className="text-foreground/30 text-xs">⚙️</span>
              </div>
            </div>

            {/* Code editor container */}
            <div className="h-[550px]">
              <RelationEditor
                value={inputText}
                onChange={setInputText}
                onValidate={handleValidate}
                loading={loading}
              />
            </div>
          </div>

          {/* RIGHT COLUMN (Stats row + Visualizer diagram) — spans 7 of 12 cols */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top row stats inside 4-card subgrid matching mockup heights */}
            <div className="grid grid-cols-4 gap-4 h-[100px]">
              {/* Total Nodes */}
              <div className="p-4 rounded-2xl border border-border bg-[#12121a]/30 flex flex-col justify-center backdrop-blur-sm hover:border-white/10 transition">
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 block mb-0.5">
                  Total Nodes
                </span>
                <div className="text-xl font-bold tracking-tight text-foreground font-mono">
                  {stats.totalNodes}
                </div>
              </div>

              {/* Active Trees */}
              <div className="p-4 rounded-2xl border border-border bg-[#12121a]/30 flex flex-col justify-center backdrop-blur-sm hover:border-white/10 transition">
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 block mb-0.5">
                  Active Trees
                </span>
                <div className="text-xl font-bold tracking-tight text-foreground font-mono">
                  {stats.activeTrees}
                </div>
              </div>

              {/* Total Relations */}
              <div className="p-4 rounded-2xl border border-border bg-[#12121a]/30 flex flex-col justify-center backdrop-blur-sm hover:border-white/10 transition">
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 block mb-0.5">
                  Total Relations
                </span>
                <div className="text-xl font-bold tracking-tight text-foreground font-mono">
                  {stats.totalRelations}
                </div>
              </div>

              {/* Errors Detected */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-center backdrop-blur-sm hover:border-white/10 transition ${
                stats.errorsDetected !== '0' ? 'border-accent-rose/30 text-accent-rose bg-accent-rose/5' : 'border-border bg-[#12121a]/30'
              }`}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 block mb-0.5">
                  Errors Detected
                </span>
                <div className="text-xl font-bold tracking-tight font-mono leading-none">
                  {stats.errorsDetected}
                </div>
              </div>
            </div>

            {/* Tree hierarchy SVG diagram container */}
            <div className="h-[550px]">
              <GraphVisualizer
                hierarchies={results?.hierarchies}
                onValidate={handleValidate}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: OUTPUT (JSON VIEW) */}
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
