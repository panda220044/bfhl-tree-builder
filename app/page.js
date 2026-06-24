'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
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
  const [activeTab, setActiveTab] = useState('Builder');
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

  // Automatically submit initial layout on load to populate the gorgeous mockup
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
      // 1. Total unique nodes
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
    <div className="flex h-screen w-screen bg-[#0a0a0f] text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-primary/10">
        {/* Workspace Top Header */}
        <header className="px-8 py-5 border-b border-border flex items-center justify-between shrink-0 bg-[#0a0a0f]/40 backdrop-blur-md">
          <h2 className="text-xl font-bold tracking-tight text-foreground/90">
            {activeTab}
          </h2>

          <div className="flex items-center space-x-3">
            {/* Tooltip Selector */}
            <div className="relative">
              <button className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-secondary border border-border hover:bg-surface-hover hover:border-border-hover transition flex items-center space-x-2 text-foreground/85">
                <span>Tooltips: Refresh View</span>
                <span className="text-[9px] opacity-60">▼</span>
              </button>
            </div>

            {/* Validate/Build Trigger Button */}
            <button
              onClick={handleValidate}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white transition shadow-lg shadow-accent-purple/20 flex items-center space-x-2 border border-accent-purple/40"
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
                  <span className="text-[9px] opacity-70">▼</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-8 flex-1 flex flex-col gap-6 overflow-hidden max-w-7xl mx-auto w-full">
          {/* Stat Cards (First Row) */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            {/* Total Nodes */}
            <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
                Total Nodes
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {stats.totalNodes}
              </div>
            </div>

            {/* Active Trees */}
            <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
                Active Trees
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {stats.activeTrees}
              </div>
            </div>

            {/* Total Relations */}
            <div className="p-5 rounded-2xl border border-border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1">
                Total Relations
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {stats.totalRelations}
              </div>
            </div>

            {/* Errors Detected */}
            <div className={`p-5 rounded-2xl border bg-[#12121a]/30 relative overflow-hidden backdrop-blur-sm ${
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

          {/* Main Workspace Columns Grid */}
          <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">
            {/* Left: RELATIONSHIP EDITOR */}
            <div className="h-full flex flex-col min-h-0">
              <RelationEditor
                value={inputText}
                onChange={setInputText}
                onValidate={handleValidate}
                loading={loading}
              />
            </div>

            {/* Right: HIERARCHY VIEW & OUTPUT */}
            <div className="h-full flex flex-col gap-6 min-h-0">
              {/* Hierarchy Visualizer Panel */}
              <div className="flex-[3] min-h-0">
                <GraphVisualizer hierarchies={results?.hierarchies} />
              </div>

              {/* JSON Output Viewer Panel */}
              <div className="flex-[2] min-h-0">
                <JsonOutput data={results} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
