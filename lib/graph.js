/**
 * graph.js — Builds hierarchies (trees & cycles) from validated edges.
 *
 * Algorithm:
 *  1. Build adjacency list (parent → sorted children)
 *  2. Find weakly-connected components via BFS on undirected edges
 *  3. For each component:
 *     - If a root exists (node with no parent) → guaranteed tree (single-parent constraint)
 *     - If no root → pure cycle → use lexicographically smallest node as root
 *  4. Compute depth (node count in longest root-to-leaf path)
 *  5. Generate summary with total_trees, total_cycles, largest_tree_root
 */

/**
 * Build all hierarchies from valid edges.
 * @param {[string,string][]} validEdges - Array of [parent, child] pairs
 * @returns {{ hierarchies: object[], summary: object }}
 */
export function buildHierarchies(validEdges) {
  if (validEdges.length === 0) {
    return {
      hierarchies: [],
      summary: {
        total_trees: 0,
        total_cycles: 0,
        largest_tree_root: null,
      },
    };
  }

  // ── Build adjacency structures ──
  const childrenOf = {};  // parent → [child, ...]
  const parentOf = {};    // child  → parent
  const allNodes = new Set();

  for (const [from, to] of validEdges) {
    allNodes.add(from);
    allNodes.add(to);

    if (!childrenOf[from]) childrenOf[from] = [];
    childrenOf[from].push(to);

    parentOf[to] = from;
  }

  // Sort children alphabetically for deterministic output
  for (const node of Object.keys(childrenOf)) {
    childrenOf[node].sort();
  }

  // ── Find weakly-connected components ──
  const undirected = {};
  for (const node of allNodes) {
    undirected[node] = [];
  }
  for (const [from, to] of validEdges) {
    undirected[from].push(to);
    undirected[to].push(from);
  }

  const visited = new Set();
  const components = [];

  // Process nodes in sorted order for deterministic component ordering
  const sortedNodes = [...allNodes].sort();

  for (const startNode of sortedNodes) {
    if (visited.has(startNode)) continue;

    const component = [];
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift();
      component.push(current);

      for (const neighbor of undirected[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component.sort());
  }

  // ── Process each component ──
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let maxDepth = 0;

  for (const component of components) {
    // Root = node that never appears as a child
    const roots = component.filter((n) => !(n in parentOf));

    if (roots.length === 0) {
      // ── Pure cycle: no root exists ──
      // Use lexicographically smallest node (component is already sorted)
      const root = component[0];
      totalCycles++;

      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
    } else {
      // ── Tree: component has a natural root ──
      // With single-parent constraint, a rooted component is always a tree
      const root = roots[0];
      totalTrees++;

      const tree = {};
      tree[root] = buildTreeRecursive(root, childrenOf);

      const depth = calculateDepth(root, childrenOf);

      // Track largest tree by depth, then lexicographic root
      if (
        depth > maxDepth ||
        (depth === maxDepth && (largestTreeRoot === null || root < largestTreeRoot))
      ) {
        maxDepth = depth;
        largestTreeRoot = root;
      }

      hierarchies.push({
        root,
        tree,
        depth,
      });
    }
  }

  return {
    hierarchies,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

/**
 * Recursively build a nested tree object.
 * @param {string} node - Current node
 * @param {Object} childrenOf - Adjacency list
 * @returns {Object} Nested tree structure, e.g. { B: { D: {} }, C: {} }
 */
function buildTreeRecursive(node, childrenOf) {
  const result = {};
  const kids = childrenOf[node] || [];

  for (const child of kids) {
    result[child] = buildTreeRecursive(child, childrenOf);
  }

  return result;
}

/**
 * Calculate the depth of a tree (number of nodes in longest root-to-leaf path).
 * @param {string} node - Root node
 * @param {Object} childrenOf - Adjacency list
 * @returns {number} Depth (single node = 1)
 */
function calculateDepth(node, childrenOf) {
  const kids = childrenOf[node] || [];

  if (kids.length === 0) return 1;

  let max = 0;
  for (const child of kids) {
    max = Math.max(max, calculateDepth(child, childrenOf));
  }

  return 1 + max;
}
