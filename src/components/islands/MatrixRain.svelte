<script lang="ts">
  import { matrixOpen } from '../../lib/store';

  let canvas = $state<HTMLCanvasElement | undefined>(undefined);

  $effect(() => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + 'px';
      canvas!.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d')!;
    const fontSize = 14 * dpr;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(0).map(() => Math.random() * canvas!.height / fontSize);
    const chars = 'IAM·STS·KMS·VPC·SCP·MFA·ABAC·RBAC·{}[]()<>=:01∀∂∇∑θλμ'.split('');
    let raf = 0;
    const tick = () => {
      ctx.fillStyle = 'rgba(10, 12, 15, 0.08)';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.98 ? '#fff' : '#6ee7c4';
        ctx.fillText(ch, x, y);
        if (y > canvas!.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') matrixOpen.set(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

{#if $matrixOpen}
  <canvas bind:this={canvas} class="matrix-rain" onclick={() => matrixOpen.set(false)}></canvas>
{/if}
