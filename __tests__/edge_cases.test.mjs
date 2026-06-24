/**
 * Comprehensive Edge Cases Test Suite for BFHL
 */

import assert from 'assert';
import { parseEdges } from '../lib/parser.js';
import { buildHierarchies } from '../lib/graph.js';

console.log('🧪 Starting BFHL Edge Cases & Extreme Inputs Tests...\n');

try {
  // ── CASE 1: Multiple Parents (Keep first, ignore rest) ──
  console.log('Testing Case 1: Multiple Parents (A->C, B->C, D->C)');
  const c1 = parseEdges(["A->C", "B->C", "D->C"]);
  assert.deepStrictEqual(c1.validEdges, [["A", "C"]]); // B->C and D->C must be ignored
  console.log('✅ Case 1 passed.');

  // ── CASE 2: Lexicographical Tie-Breaker for Largest Tree ──
  console.log('\nTesting Case 2: Lexicographical Tie-Breaker for Largest Tree (Equal Depths)');
  // Tree B->C (depth 2, root B)
  // Tree A->D (depth 2, root A)
  const c2 = parseEdges(["B->C", "A->D"]);
  const h2 = buildHierarchies(c2.validEdges);
  assert.strictEqual(h2.summary.total_trees, 2);
  assert.strictEqual(h2.summary.largest_tree_root, 'A'); // 'A' < 'B', tie broken alphabetically
  console.log('✅ Case 2 passed.');

  // ── CASE 3: Trim Whitespace and Format Verification ──
  console.log('\nTesting Case 3: Trim Whitespace');
  const c3 = parseEdges(["  A->B  ", "\tC->D\n"]);
  assert.deepStrictEqual(c3.validEdges, [["A", "B"], ["C", "D"]]);
  console.log('✅ Case 3 passed.');

  // ── CASE 4: Mixed Empty Strings & Strange Formats ──
  console.log('\nTesting Case 4: Rejects empty strings and strange formats');
  const c4 = parseEdges(["", "   ", "A->B->C", "A->B->", "->B", "A-B", "A > B"]);
  assert.deepStrictEqual(c4.validEdges, []);
  assert.strictEqual(c4.invalidEntries.length, 7);
  console.log('✅ Case 4 passed.');

  // ── CASE 5: Complex Interlocking Cycle & Trees ──
  console.log('\nTesting Case 5: Complex Component Mix');
  // Tree 1: M->N->O (depth 3)
  // Cycle 1: X->Y->Z->X (cycle)
  // Tree 2: P->Q (depth 2)
  const c5 = parseEdges([
    "M->N", "N->O",
    "X->Y", "Y->Z", "Z->X",
    "P->Q"
  ]);
  const h5 = buildHierarchies(c5.validEdges);
  assert.strictEqual(h5.summary.total_trees, 2);
  assert.strictEqual(h5.summary.total_cycles, 1);
  assert.strictEqual(h5.summary.largest_tree_root, 'M'); // M has depth 3, P has depth 2
  console.log('✅ Case 5 passed.');

  console.log('\n🎉 ALL EDGE CASE TESTS PASSED SUCCESSFULLY! 🎉');
} catch (err) {
  console.error('\n❌ Edge Case Test Failure detected:');
  console.error(err);
  process.exit(1);
}
