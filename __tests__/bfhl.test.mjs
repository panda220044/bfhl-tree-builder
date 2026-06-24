/**
 * Automated test suite for BFHL parser and graph builder logic.
 * Run with: npm test (or: node __tests__/bfhl.test.mjs)
 */

import assert from 'assert';
import { parseEdges } from '../lib/parser.js';
import { buildHierarchies } from '../lib/graph.js';

console.log('🧪 Starting BFHL Rule Validation Tests...\n');

try {
  // ── RULE 1: Node Format Validation ──
  console.log('Testing Rule 1: Node Format Validation');
  const r1 = parseEdges([
    "A->B",       // Valid
    "  C->D  ",   // Valid (whitespace trimmed)
    "hello",      // Invalid
    "1->2",       // Invalid
    "AB->C",      // Invalid
    "A-B",        // Invalid
    "A->",        // Invalid
    "A->A",       // Invalid (self-loop)
    ""            // Invalid (empty)
  ]);
  assert.deepStrictEqual(r1.validEdges, [['A', 'B'], ['C', 'D']]);
  assert.deepStrictEqual(r1.invalidEntries, ['hello', '1->2', 'AB->C', 'A-B', 'A->', 'A->A', '']);
  console.log('✅ Rule 1 passed.');

  // ── RULE 2: Duplicate Edges ──
  console.log('\nTesting Rule 2: Duplicate Edges');
  const r2 = parseEdges([
    "A->B",
    "A->C",
    "A->B",  // Duplicate
    "A->B"   // Duplicate (store once)
  ]);
  assert.deepStrictEqual(r2.validEdges, [['A', 'B'], ['A', 'C']]);
  assert.deepStrictEqual(r2.duplicateEdges, ['A->B']);
  console.log('✅ Rule 2 passed.');

  // ── RULE 3: Multi-parent handling ──
  console.log('\nTesting Rule 3: Multi-parent handling');
  const r3 = parseEdges([
    "A->D",
    "B->D"   // D already has parent A, ignore B->D
  ]);
  assert.deepStrictEqual(r3.validEdges, [['A', 'D']]);
  console.log('✅ Rule 3 passed.');

  // ── RULE 4 & 7: Tree construction & Generation ──
  console.log('\nTesting Rules 4 & 7: Tree construction & Generation');
  const r4 = parseEdges([
    "A->B",
    "A->C",
    "B->D"
  ]);
  const h4 = buildHierarchies(r4.validEdges);
  assert.strictEqual(h4.hierarchies.length, 1);
  assert.strictEqual(h4.hierarchies[0].root, 'A');
  assert.deepStrictEqual(h4.hierarchies[0].tree, {
    A: {
      B: {
        D: {}
      },
      C: {}
    }
  });
  console.log('✅ Rules 4 & 7 passed.');

  // ── RULE 5 & 6: Pure cycles ──
  console.log('\nTesting Rules 5 & 6: Pure cycles');
  // Pure cycle X->Y, Y->Z, Z->X
  const r5 = parseEdges([
    "X->Y",
    "Y->Z",
    "Z->X"
  ]);
  const h5 = buildHierarchies(r5.validEdges);
  assert.strictEqual(h5.hierarchies.length, 1);
  // Lexicographically smallest node as root: X, Y, Z -> X
  assert.strictEqual(h5.hierarchies[0].root, 'X');
  assert.strictEqual(h5.hierarchies[0].has_cycle, true);
  assert.deepStrictEqual(h5.hierarchies[0].tree, {});
  assert.strictEqual(h5.hierarchies[0].depth, undefined); // Do not include depth for cycles
  console.log('✅ Rules 5 & 6 passed.');

  // ── RULE 8: Depth ──
  console.log('\nTesting Rule 8: Depth');
  const r8 = parseEdges([
    "A->B",
    "B->C",
    "C->D"
  ]);
  const h8 = buildHierarchies(r8.validEdges);
  assert.strictEqual(h8.hierarchies[0].depth, 4); // A -> B -> C -> D has 4 nodes
  console.log('✅ Rule 8 passed.');

  // ── RULE 9 & 10: Summary & Largest Tree Root ──
  console.log('\nTesting Rules 9 & 10: Summary & Largest Tree Root');
  const r9 = parseEdges([
    // Tree 1: depth 3 (A->B->C)
    "A->B",
    "B->C",
    // Tree 2: depth 2 (E->F)
    "E->F",
    // Cycle 1: (X->Y->Z->X)
    "X->Y",
    "Y->Z",
    "Z->X"
  ]);
  const h9 = buildHierarchies(r9.validEdges);
  assert.strictEqual(h9.summary.total_trees, 2);
  assert.strictEqual(h9.summary.total_cycles, 1);
  assert.strictEqual(h9.summary.largest_tree_root, 'A'); // Depth 3 vs Depth 2
  console.log('✅ Rules 9 & 10 passed.');

  console.log('\n🎉 ALL BFHL CORE ALGORITHM TESTS PASSED SUCCESSFULLY! 🎉');
} catch (err) {
  console.error('\n❌ Test Failure detected:');
  console.error(err);
  process.exit(1);
}
