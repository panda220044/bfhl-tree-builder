/**
 * parser.js — Validates, deduplicates, and filters edge strings.
 *
 * Rules implemented:
 *  1. Format: "X->Y" where X,Y are single uppercase A-Z, X !== Y
 *  2. Whitespace is trimmed before validation
 *  3. First occurrence of a duplicate edge is kept; extras go to duplicate_edges (stored once)
 *  4. If a child already has a parent, later parent edges are silently ignored (multi-parent)
 */

const EDGE_REGEX = /^([A-Z])->([A-Z])$/;

/**
 * Parse an array of raw edge strings.
 * @param {string[]} data - Array of edge strings like ["A->B", "A->C"]
 * @returns {{ validEdges: [string,string][], invalidEntries: string[], duplicateEdges: string[] }}
 */
export function parseEdges(data) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const validEdges = [];

  const seenEdges = new Set();        // track first-seen edges
  const seenDuplicates = new Set();   // ensure each duplicate stored once
  const childToParent = new Map();    // enforce single-parent constraint

  for (const raw of data) {
    // Trim whitespace before any validation
    const entry = (typeof raw === 'string') ? raw.trim() : String(raw).trim();

    // Empty string check
    if (entry.length === 0) {
      invalidEntries.push(entry);
      continue;
    }

    // Validate format: must be exactly X->Y with single uppercase letters
    const match = entry.match(EDGE_REGEX);
    if (!match) {
      invalidEntries.push(entry);
      continue;
    }

    const from = match[1];
    const to = match[2];

    // Self-loop: A->A is invalid
    if (from === to) {
      invalidEntries.push(entry);
      continue;
    }

    const edgeKey = `${from}->${to}`;

    // Duplicate edge: first occurrence kept, subsequent stored once in duplicateEdges
    if (seenEdges.has(edgeKey)) {
      if (!seenDuplicates.has(edgeKey)) {
        duplicateEdges.push(edgeKey);
        seenDuplicates.add(edgeKey);
      }
      continue;
    }
    seenEdges.add(edgeKey);

    // Multi-parent: if this child already has a parent, ignore this edge silently
    if (childToParent.has(to)) {
      continue;
    }
    childToParent.set(to, from);

    validEdges.push([from, to]);
  }

  return { validEdges, invalidEntries, duplicateEdges };
}
