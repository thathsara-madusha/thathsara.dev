<script lang="ts">
  import { onMount } from 'svelte';
  import { snakeOpen } from '../../lib/store';

  let canvas: HTMLCanvasElement;
  let score = $state(0);
  let gameOver = $state(false);

  const GRID = 24;
  const CELL = 14;

  type Pt = { x: number; y: number };
  let snake: Pt[] = [{ x: 10, y: 10 }];
  let dir: Pt = { x: 1, y: 0 };
  let food: Pt = { x: 14, y: 10 };

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    food = { x: 14, y: 10 };
    score = 0;
    gameOver = false;
  }

  function close() { snakeOpen.set(false); reset(); }

  $effect(() => {
    if (!$snakeOpen) return;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0, last = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 120) return;
      last = t;
      const head: Pt = { x: (snake[0].x + dir.x + GRID) % GRID, y: (snake[0].y + dir.y + GRID) % GRID };
      if (snake.some(p => p.x === head.x && p.y === head.y)) { gameOver = true; cancelAnimationFrame(raf); return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
      } else {
        snake.pop();
      }
      ctx.fillStyle = '#0a0c0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e8b34a';
      ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);
      snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#6ee7c4' : `rgba(110, 231, 196, ${1 - i / 30})`;
        ctx.fillRect(p.x * CELL, p.y * CELL, CELL - 1, CELL - 1);
      });
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowUp'    && dir.y === 0) dir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown'  && dir.y === 0) dir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft'  && dir.x === 0) dir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
      if (e.key === 'r' && gameOver) reset();
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  });
</script>

{#if $snakeOpen}
  <div class="snake-modal">
    <div class="frame">
      <div style="color: var(--amber); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px;">// snake.exe</div>
      <canvas bind:this={canvas} width={GRID * CELL} height={GRID * CELL}></canvas>
      <div class="ctrl">
        <span class="score">score · {score}</span>
        <span style="color: var(--fg-mute)">arrows · esc to exit</span>
        <button class="close" onclick={close}>[x]</button>
      </div>
      {#if gameOver}
        <div style="margin-top: 8px; text-align: center;">
          <span style="color: var(--coral)">GAME OVER · final score {score}</span>
          ·
          <button style="color: var(--amber); cursor: pointer; background: none; border: none; font: inherit;" onclick={reset}>[r] restart</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .close { background: none; border: none; color: var(--fg-mute); font: inherit; cursor: pointer; }
  .close:hover { color: var(--fg); }
</style>
