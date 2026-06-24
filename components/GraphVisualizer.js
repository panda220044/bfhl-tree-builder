'use client';

import React from 'react';

export default function GraphVisualizer({ hierarchies = [] }) {
  if (!hierarchies || hierarchies.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-foreground/35">
        <span className="text-4xl mb-2">🌿</span>
        <h3 className="text-sm font-semibold">No Graph Data</h3>
        <p className="text-xs max-w-xs mt-1 leading-relaxed">
          Submit relations in the editor on the left to render the tree hierarchies.
        </p>
      </div>
    );
  }

  // Dimension settings
  const width = 800;
  const height = 450;

  const nodes = [];
  const links = [];
  const H = hierarchies.length;
  const secWidth = width / H;

  // Track colors for different components
  const getColorScheme = (hierarchy, index) => {
    if (hierarchy.has_cycle) {
      return {
        stroke: '#f43f5e',
        fill: 'rgba(244, 63, 94, 0.1)',
        glow: 'url(#rose-glow)',
        marker: 'url(#arrow-rose)',
        accent: 'text-accent-rose',
      };
    }
    // Alternate tree colors
    if (index % 2 === 0) {
      return {
        stroke: '#8b5cf6',
        fill: 'rgba(139, 92, 246, 0.1)',
        glow: 'url(#purple-glow)',
        marker: 'url(#arrow-purple)',
        accent: 'text-accent-purple',
      };
    } else {
      return {
        stroke: '#06b6d4',
        fill: 'rgba(6, 182, 212, 0.1)',
        glow: 'url(#cyan-glow)',
        marker: 'url(#arrow-cyan)',
        accent: 'text-accent-cyan',
      };
    }
  };

  // Layout algorithm
  hierarchies.forEach((hierarchy, hIndex) => {
    const scheme = getColorScheme(hierarchy, hIndex);
    const xMin = hIndex * secWidth + 30;
    const xMax = (hIndex + 1) * secWidth - 30;

    if (hierarchy.has_cycle) {
      // ── Pure Cycle circular layout ──
      const cycleNodes = hierarchy.cycle_nodes || [hierarchy.root];
      const L = cycleNodes.length;
      const cx = (xMin + xMax) / 2;
      const cy = height / 2 - 10;
      const r = Math.min(secWidth / 3.5, 75);

      const cyclePositions = {};

      cycleNodes.forEach((nodeName, index) => {
        const theta = (2 * Math.PI * index) / L - Math.PI / 2;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);

        cyclePositions[nodeName] = { x, y };

        nodes.push({
          name: nodeName,
          x,
          y,
          scheme,
          isCycle: true,
        });
      });

      // Build cyclic links
      for (let i = 0; i < L; i++) {
        const from = cycleNodes[i];
        const to = cycleNodes[(i + 1) % L];
        links.push({
          from: cyclePositions[from],
          to: cyclePositions[to],
          scheme,
        });
      }
    } else {
      // ── Tree layout ──
      const tree = hierarchy.tree;
      const root = hierarchy.root;

      const traverseTree = (nodeName, currentSubtree, depth, xStart, xEnd) => {
        const x = (xStart + xEnd) / 2;
        const y = 60 + depth * 90;

        const parentPos = { x, y };

        nodes.push({
          name: nodeName,
          x,
          y,
          scheme,
          isCycle: false,
        });

        const children = Object.keys(currentSubtree || {});
        const C = children.length;

        if (C > 0) {
          const w = (xEnd - xStart) / C;
          children.forEach((childName, idx) => {
            const childXStart = xStart + idx * w;
            const childXEnd = childXStart + w;
            const childPos = traverseTree(
              childName,
              currentSubtree[childName],
              depth + 1,
              childXStart,
              childXEnd
            );

            links.push({
              from: parentPos,
              to: childPos,
              scheme,
            });
          });
        }

        return parentPos;
      };

      if (tree[root]) {
        traverseTree(root, tree[root], 0, xMin, xMax);
      } else {
        nodes.push({
          name: root,
          x: (xMin + xMax) / 2,
          y: 60,
          scheme,
          isCycle: false,
        });
      }
    }
  });

  return (
    <div className="w-full flex flex-col h-full bg-[#12121a]/30 border border-border rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          HIERARCHY VIEW
        </h3>
        <div className="flex space-x-2">
          <span className="text-[10px] bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald px-2 py-0.5 rounded font-mono font-semibold">
            Success [✓ Validated]
          </span>
          {hierarchies.some((h) => h.has_cycle) && (
            <span className="text-[10px] bg-accent-rose/10 border border-accent-rose/20 text-accent-rose px-2 py-0.5 rounded font-mono font-semibold">
              ⚠️ Warning
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 bg-surface-primary/10 rounded-xl overflow-hidden relative border border-border/30">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Filters for neon glow dropshadows */}
          <defs>
            <filter id="purple-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.8" />
            </filter>
            <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
            <filter id="rose-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>

            {/* Directing arrows for connection paths */}
            <marker
              id="arrow-purple"
              viewBox="0 0 10 10"
              refX="23"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
            </marker>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="23"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
            </marker>
            <marker
              id="arrow-rose"
              viewBox="0 0 10 10"
              refX="23"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render Link Connection Paths */}
          {links.map((link, idx) => (
            <line
              key={idx}
              x1={link.from.x}
              y1={link.from.y}
              x2={link.to.x}
              y2={link.to.y}
              stroke={link.scheme.stroke}
              strokeWidth="2"
              opacity="0.85"
              markerEnd={link.scheme.marker}
              className="transition-all duration-300"
            />
          ))}

          {/* Render Nodes */}
          {nodes.map((node, idx) => (
            <g key={idx} className="cursor-pointer group">
              {/* Glowing Outer Ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r="18"
                stroke={node.scheme.stroke}
                strokeWidth="2"
                fill={node.scheme.fill}
                filter={node.scheme.glow}
                className="transition-all duration-300 group-hover:r-20"
              />
              
              {/* Inner Circle Base */}
              <circle
                cx={node.x}
                cy={node.y}
                r="18"
                fill="#0a0a0f"
                stroke="transparent"
              />

              {/* Node Name Text */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy=".3em"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                {node.name}
              </text>

              {/* Cycle Warning icon overlay */}
              {node.isCycle && (
                <g transform={`translate(${node.x + 10}, ${node.y + 10})`}>
                  <circle cx="0" cy="0" r="6" fill="#f43f5e" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="7"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    !
                  </text>
                </g>
              )}

              {/* Tooltip on hover */}
              <title>Node {node.name} {node.isCycle ? '(In Cycle Component)' : ''}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
