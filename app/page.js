'use client';

import React, { useState } from 'react';
import SummaryCards from '@/components/SummaryCards';
import IssuePanel from '@/components/IssuePanel';
import TreeVisualizer from '@/components/TreeVisualizer';

const DEFAULT_SAMPLE_INPUT = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X`;

export default function Home() {
  const [inputText, setInputText] = useState(DEFAULT_SAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' | 'raw_json'

  const handleLoadSample = () => {
    setInputText(DEFAULT_SAMPLE_INPUT);
    setError(null);
  };

  const handleClear = () => {
    setInputText('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Split input by newlines, commas, or spaces, and clean them
    const lines = inputText
      .split(/[\n,]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError('Please provide at least one relation to parse.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: lines }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process hierarchy');
      }

      setResults(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-mono mb-4">
          <span>🚀 BFHL Code Assessment Solution</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-foreground/90 to-white/50 mb-3">
          BFHL Tree Hierarchy Builder
        </h1>
        <p className="text-sm sm:text-base text-foreground/60 max-w-2xl mx-auto">
          Input your node connections (e.g. <code className="font-mono bg-surface-secondary px-1.5 py-0.5 rounded text-accent-cyan">X-&gt;Y</code>) 
          to automatically build trees, resolve multi-parent cases, isolate duplicate edges, and detect cycles instantly.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Form (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-surface-secondary/40 backdrop-blur-md relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 left-0 w-32 h-32 blur-3xl opacity-[0.02] bg-accent-purple rounded-full" />

            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              <span>Relation Inputs</span>
              <span className="text-xs font-mono text-foreground/40 font-normal">One edge per line</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  id="edge-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`A->B\nB->C`}
                  className="w-full h-72 px-4 py-3 rounded-xl bg-surface-primary border border-border hover:border-border-hover focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple text-sm font-mono transition resize-none placeholder-foreground/30 text-foreground"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg bg-surface-hover hover:bg-white/10 border border-border hover:border-border-hover transition"
                  >
                    Sample Input
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg text-foreground/60 hover:text-foreground hover:bg-surface-hover transition"
                  >
                    Clear
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-purple/95 hover:to-accent-blue/95 transition shadow-lg shadow-accent-purple/20 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Process Graph</span>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-accent-rose/5 border border-accent-rose/25 text-xs text-accent-rose animate-slide-up flex items-start space-x-2">
                <span className="font-bold">Error:</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
          </div>

          {/* User Details Display Card */}
          <div className="p-5 rounded-2xl border border-border bg-surface-secondary/20 text-xs text-foreground/50 space-y-2">
            <h3 className="font-bold text-foreground/70 uppercase tracking-wider text-[10px]">Developer Context</h3>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>User ID:</div>
              <div className="text-foreground/80 text-right">{results?.user_id || 'eashita_24062026'}</div>
              <div>Email ID:</div>
              <div className="text-foreground/80 text-right">{results?.email_id || 'eashita@college.edu'}</div>
              <div>Roll Number:</div>
              <div className="text-foreground/80 text-right">{results?.college_roll_number || '26BCE1001'}</div>
            </div>
          </div>
        </section>

        {/* Right Output View (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6 animate-slide-up">
              {/* Summary Metrics Section */}
              <div>
                <h2 className="text-lg font-bold mb-3">Run Summary</h2>
                <SummaryCards summary={results.summary} />
              </div>

              {/* Edge/Format Warnings Panels */}
              <IssuePanel 
                invalidEntries={results.invalid_entries} 
                duplicateEdges={results.duplicate_edges} 
              />

              {/* Visualizer and raw JSON Output Section */}
              <div className="border border-border rounded-2xl bg-surface-secondary/40 backdrop-blur-md overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border bg-surface-primary/60 px-2 pt-2">
                  <button
                    onClick={() => setActiveTab('visualizer')}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                      activeTab === 'visualizer'
                        ? 'border-accent-purple text-accent-purple bg-surface-secondary/50'
                        : 'border-transparent text-foreground/50 hover:text-foreground hover:bg-surface-secondary/25'
                    }`}
                  >
                    Hierarchy Visualizer
                  </button>
                  <button
                    onClick={() => setActiveTab('raw_json')}
                    className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
                      activeTab === 'raw_json'
                        ? 'border-accent-purple text-accent-purple bg-surface-secondary/50'
                        : 'border-transparent text-foreground/50 hover:text-foreground hover:bg-surface-secondary/25'
                    }`}
                  >
                    Raw API JSON
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'visualizer' ? (
                    <TreeVisualizer hierarchies={results.hierarchies} />
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
                        className="absolute right-2 top-2 px-2.5 py-1.5 text-[10px] font-mono font-medium rounded bg-surface-hover hover:bg-white/10 border border-border transition text-foreground/75 hover:text-foreground"
                      >
                        Copy JSON
                      </button>
                      <pre className="p-4 rounded-xl bg-surface-primary border border-border text-xs font-mono overflow-auto max-h-96 text-accent-cyan/90 leading-relaxed">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-surface-secondary/10 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
                🌿
              </div>
              <h3 className="text-base font-bold mb-1">Awaiting Edge Input</h3>
              <p className="text-xs text-foreground/45 max-w-sm">
                Paste your edge list in the text editor on the left and click "Process Graph" to inspect structured trees and components.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/50 py-6 text-center text-xs text-foreground/30 font-mono">
        Built with Next.js 15, Tailwind CSS, & Vercel. All rights reserved.
      </footer>
    </div>
  );
}
