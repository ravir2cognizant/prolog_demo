/**
 * Monotonic in-memory ID allocators -- replace with DB sequences in a real system.
 */
export function makeCounter(start = 1): () => number {
  let n = start;
  return () => n++;
}
