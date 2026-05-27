// Konami code listener — call setup() once in a client-only context.
export function setupKonami(onUnlock: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let idx = 0;
  const onKey = (e: KeyboardEvent) => {
    const tgt = e.target as HTMLElement | null;
    if (tgt && tgt.tagName === 'INPUT') return;
    const k = e.key;
    const want = seq[idx];
    if (k === want || (want === 'b' && k.toLowerCase() === 'b') || (want === 'a' && k.toLowerCase() === 'a')) {
      idx++;
      if (idx === seq.length) { onUnlock(); idx = 0; }
    } else {
      idx = 0;
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
