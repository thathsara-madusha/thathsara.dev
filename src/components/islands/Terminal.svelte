<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { cmdBus, pushToast } from '../../lib/store';
  import { projects, writing, identity } from '../../lib/data';
  import type { WorkspaceId } from '../../lib/data';

  /* ============================================================
     CONSTANTS
     ============================================================ */
  const ASCII_LOGO = `
 ████████ ██   ██  █████  ████████ ██   ██ ███████  █████  ██████   █████   
    ██    ██   ██ ██   ██    ██    ██   ██ ██      ██   ██ ██   ██ ██   ██  
    ██    ███████ ███████    ██    ███████ ███████ ███████ ██████  ███████  
    ██    ██   ██ ██   ██    ██    ██   ██      ██ ██   ██ ██   ██ ██   ██  
    ██    ██   ██ ██   ██    ██    ██   ██ ███████ ██   ██ ██   ██ ██   ██  
`;

  const NEOFETCH = `
   ▄▀█▀▄    \u00A0thathsara@portfolio
  ▄▀ ▄ ▀▄   \u00A0--------------------
 ▄▀  ▄  ▀▄  \u00A0os         portfolio-os 26.05 (kernel: astro-5)
▀▄  ▄▄▄  ▄▀ \u00A0host       browser // ${typeof navigator !== 'undefined' ? navigator.platform || 'n/a' : 'n/a'}
 ▀▄  ▄  ▄▀  \u00A0uptime     2y 14d
  ▀▄ ▄ ▄▀   \u00A0shell      thath-sh 1.4
   ▀▄▀▄▀    \u00A0wm         tile (8 workspaces)
            \u00A0cpu        m3 max (perf · 71% gpu util)
            \u00A0mem        38G / 64G
            \u00A0role       ML × Cloud Security engineer
            \u00A0loc        Colombo, LK (UTC+05:30)
            \u00A0now        training shadow-rbac, brewing v60 #3
`;

  const FORTUNES = [
    'every classifier is a policy. — me, 2024',
    'security is a graph problem people draw as a checklist.',
    'a TODO comment is a fossil. archaeologists will date your codebase by them.',
    'the cloud is just somebody else\u2019s computer, but with bills.',
    'pretraining is mostly waiting; finetuning is mostly negotiating with your loss.',
    'if your IAM doc needs a comment, rewrite it.',
    'silence is the most expensive metric.',
    'you are one IAM trust policy away from a story.',
  ];

  const COMMANDS: [string, string][] = [
    ['help', 'show this list'],
    ['whoami', 'who is running this'],
    ['ls', 'list workspaces'],
    ['cd <ws>', 'switch workspace (about, projects, oss, blog, stack, cv, now, hero)'],
    ['cat <file>', 'print a file (about.md, contact.txt, resume.pdf)'],
    ['projects', 'list ML / security projects'],
    ['blog', 'list writings'],
    ['stack', 'show skill stack'],
    ['contact', 'how to reach me'],
    ['neofetch', 'system info'],
    ['ssh root@thathsara.dev', 'fun'],
    ['scan <target>', 'pretend to scan something'],
    ['train <model>', 'pretend to train something'],
    ['theme <name>', 'amber | matrix | red-team | reset'],
    ['matrix', 'enter the matrix'],
    ['snake', 'play snake (esc to exit)'],
    ['fortune', 'a maxim'],
    ['coffee', 'brew a v60'],
    ['clear / cls', 'clear the screen'],
    ['exit', 'collapse terminal'],
    ['?', 'secret commands exist. find them.'],
  ];

  /* ============================================================
     STATE
     ============================================================ */
  type Line = { id: string; html: string };
  let lines = $state<Line[]>([]);
  let input = $state('');
  let history = $state<string[]>([]);
  let histIdx = $state(-1);
  let mode = $state<'open' | 'collapsed' | 'maximized'>('open');
  let body = $state<HTMLDivElement | undefined>(undefined);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  $effect(() => { if (mode !== 'collapsed') inputEl?.focus(); });

  /* helpers */
  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function uid() { return Math.random().toString(36).slice(2); }
  function push(html: string) { lines = [...lines, { id: uid(), html }]; }
  function pushAll(arr: string[]) { lines = [...lines, ...arr.map(html => ({ id: uid(), html }))]; }

  const PROMPT = `<span class="ps">thathsara</span><span class="at">@portfolio</span><span class="at">:</span><span class="pwd">~</span><span class="at">$ </span>`;

  /* ============================================================
     MOUNT — seed welcome lines
     ============================================================ */
  onMount(() => {
    lines = [
      { id: uid(), html: `<pre style="margin:0;color:var(--amber);font-size:8.5px;line-height:1.1;">${esc(ASCII_LOGO)}</pre>` },
      { id: uid(), html: `<span style="color:var(--mint)">welcome.</span> <span class="dim">type </span><span style="color:var(--amber)">help</span><span class="dim"> for commands, </span><span style="color:var(--amber)">ls</span><span class="dim"> to see workspaces, </span><span style="color:var(--amber)">secrets</span><span class="dim"> if you’re curious.</span>` },
      { id: uid(), html: `<span class="dim">tip: ↑/↓ for history · tab to complete · ctrl-l to clear · ctrl-m to maximize</span>` },
    ];
  });

  $effect(() => {
    // Auto-scroll when lines change
    lines;
    const el = body; if (el) tick().then(() => { el.scrollTop = el.scrollHeight; });
  });

  /* ============================================================
     COMMAND DISPATCH
     ============================================================ */
  function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`<span class="cmd">${PROMPT}<span style="color:var(--fg)">${esc(cmd)}</span></span>`);
    history = [cmd, ...history].slice(0, 80);
    histIdx = -1;
    const parts = cmd.split(/\s+/);
    const c = parts[0].toLowerCase();
    const rest = parts.slice(1).join(' ');

    switch (c) {
      case 'help':
      case '?': {
        push(`<span class="amber">// available commands</span>`);
        pushAll(COMMANDS.map(([k, d]) => `<span style="color:var(--mint);display:inline-block;width:230px">${esc(k)}</span><span class="dim">${esc(d)}</span>`));
        push(`<span class="dim">(some commands are intentionally undocumented)</span>`);
        break;
      }
      case 'whoami': {
        pushAll([
          `${identity.name} <span class="dim">— ${identity.role}</span>`,
          `<span class="dim">${identity.location} · ${identity.timezone} · uptime ${identity.uptime}</span>`,
          `<span class="dim">currently: ML Security Lead · shipping shadow-rbac · writing a book</span>`,
        ]);
        break;
      }
      case 'ls':
      case 'dir': {
        push(`<span class="dim">workspaces/</span>`);
        const ws: [string, string][] = [
          ['1_hero/', 'landing'], ['2_about/', 'whoami.md'],
          ['3_projects/', 'ml + security'], ['4_oss/', 'github contributions'],
          ['5_blog/', 'writing log'], ['6_stack/', 'skills.toml'],
          ['7_cv/', 'git log --author=thathsara'], ['8_now/', 'currently running'],
        ];
        pushAll(ws.map(([n, d]) => `<span style="color:var(--azure);display:inline-block;width:130px">${n}</span><span class="dim">${d}</span>`));
        break;
      }
      case 'cd': {
        const map: Record<string, WorkspaceId> = {
          hero: 'hero', '1': 'hero', about: 'about', '2': 'about', projects: 'projects', '3': 'projects',
          oss: 'oss', '4': 'oss', blog: 'blog', writing: 'blog', '5': 'blog',
          stack: 'stack', skills: 'stack', '6': 'stack', cv: 'cv', timeline: 'cv', '7': 'cv',
          now: 'now', '8': 'now',
        };
        const key = rest.toLowerCase().replace(/^~?\/?/, '');
        const t = map[key];
        if (t) { cmdBus.nav(t); push(`<span class="ok">→ workspace switched to ${esc(t)}</span>`); }
        else push(`<span class="err">cd: no such workspace: ${esc(rest)}</span>`);
        break;
      }
      case 'cat': {
        const f = rest.toLowerCase();
        if (f === 'about.md' || f === 'about') { cmdBus.nav('about'); push(`<span class="ok">opening about.md →</span>`); }
        else if (f === 'contact.txt' || f === 'contact') {
          pushAll([
            `<span class="dim">email:&nbsp;&nbsp;&nbsp;</span>${identity.email}`,
            `<span class="dim">github:&nbsp;&nbsp;</span>github.com/${identity.github}`,
            `<span class="dim">twitter:&nbsp;</span>@${identity.twitter}`,
            `<span class="dim">pgp:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color:var(--mint)">${identity.pgp}</span>`,
            `<span class="dim">prefer encrypted mail for anything sensitive. response: 24-48h.</span>`,
          ]);
        }
        else if (f === 'resume.pdf' || f === 'cv.pdf') push(`<span class="err">cat: resume.pdf: cannot open binary file. try: cd cv</span>`);
        else if (f === '/etc/passwd') push(`<span class="err">cat: /etc/passwd: permission denied. nice try.</span>`);
        else if (f === '/etc/shadow') push(`<span class="err">cat: /etc/shadow: permission denied. <span class="dim">(seriously?)</span></span>`);
        else if (f === '.bashrc') push(`<span class="dim">alias rm='rm -i'  # learned that the hard way</span>`);
        else if (f === '.ssh/id_rsa') { push(`<span class="err">cat: .ssh/id_rsa: nope.</span>`); push(`<span class="dim">[logged to ~/.audit/2026-05-27.log]</span>`); }
        else push(`<span class="err">cat: ${esc(rest)}: no such file</span>`);
        break;
      }
      case 'projects': {
        push(`<span class="amber">// ${projects.length} projects</span>`);
        pushAll(projects.map(p =>
          `<span style="color:var(--mint)">${p.name.padEnd(14)}</span>` +
          `<span class="dim">${p.lang.padEnd(16)} </span>` +
          `<span style="color:var(--amber)">★${p.stars.padEnd(6)} </span>` +
          `<span class="dim">${esc(p.blurb.slice(0, 60))}…</span>`));
        push(`<span class="dim">→ <span style="color:var(--amber)">cd projects</span> for details</span>`);
        break;
      }
      case 'blog':
      case 'writing': {
        push(`<span class="amber">// ${writing.length} entries</span>`);
        pushAll(writing.slice(0, 8).map(e => `<span class="dim">${e.ts}</span> <span style="color:var(--azure)">[${e.lvl}]</span> ${esc(e.title)}`));
        break;
      }
      case 'stack':
      case 'skills': cmdBus.nav('stack'); push(`<span class="ok">→ ~/skills.toml</span>`); break;
      case 'contact': run('cat contact.txt'); break;
      case 'neofetch':
        push(`<pre style="margin:0;font-size:10.5px;line-height:1.4;color:var(--fg-soft)">${esc(NEOFETCH)}</pre>`); break;
      case 'ssh': {
        const tgt = rest || 'root@thathsara.dev';
        push(`<span class="dim">ssh: connecting to ${esc(tgt)}...</span>`);
        setTimeout(() => push(`<span class="err">ssh: connection refused. (this is a portfolio, not a shell.)</span>`), 400);
        break;
      }
      case 'scan': {
        const tgt = rest || 'localhost';
        push(`<span class="dim">nmap-lite scanning ${esc(tgt)}...</span>`);
        const ports = [
          '22/tcp   open   ssh        OpenSSH 9.6',
          '80/tcp   open   http       portfolio/1.0',
          '443/tcp  open   https      portfolio/1.0 (TLS 1.3)',
          '6379/tcp closed redis      -',
          '8080/tcp filtered',
          '9090/tcp open   prometheus -',
        ];
        ports.forEach((p, i) => setTimeout(() =>
          push(`<span style="color:${i < 3 ? 'var(--mint)' : 'var(--fg-mute)'}">${esc(p)}</span>`), 200 + i * 180));
        setTimeout(() => push(`<span class="dim">scan complete — 6 ports, 4 open, 0 anomalies.</span>`), 200 + ports.length * 180 + 100);
        break;
      }
      case 'train': {
        const m = rest || 'mlp-toy';
        push(`<span class="dim">launching training run for <span style="color:var(--mint)">${esc(m)}</span>...</span>`);
        let step = 0;
        const id = setInterval(() => {
          step++;
          const loss = (2.8 * Math.exp(-step / 8) + 0.04 + Math.random() * 0.02).toFixed(4);
          push(`<span class="dim">[step ${String(step).padStart(3, ' ')}/12] </span>loss=<span style="color:var(--amber)">${loss}</span> <span class="dim">lr=3e-5</span>`);
          if (step >= 12) { clearInterval(id); push(`<span class="ok">✓ training done. checkpoint saved. (also: this is fake.)</span>`); }
        }, 220);
        break;
      }
      case 'theme': {
        const t = rest.toLowerCase();
        if (['amber', 'matrix', 'red-team', 'redteam', 'reset', 'default'].includes(t)) {
          const final = t === 'redteam' ? 'red-team' : t === 'default' || t === 'reset' ? 'amber' : t;
          cmdBus.setTheme(final as 'amber' | 'matrix' | 'red-team');
          push(`<span class="ok">theme → ${esc(t)}</span>`);
        } else push(`<span class="err">theme: unknown — try: amber, matrix, red-team, reset</span>`);
        break;
      }
      case 'matrix': cmdBus.openMatrix(); push(`<span class="ok">entering the matrix... (press esc to exit)</span>`); break;
      case 'snake': cmdBus.openSnake(); push(`<span class="ok">snake.exe launched. esc to exit.</span>`); break;
      case 'fortune': {
        const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        push(`<span style="color:var(--violet)">" ${esc(f)} "</span>`);
        break;
      }
      case 'coffee': {
        push(`<span class="dim">brewing v60... grinding hario-honduras at 6.5...</span>`);
        const stages = [
          '00:00  bloom — 60g water, 30s wait',
          '00:30  first pour — slow concentric, 120g',
          '01:00  second pour — outside in, 200g',
          '01:30  third pour — 280g',
          '02:00  drawdown',
          '03:15  done. tds 1.42 · ext 21.1 · god-tier',
        ];
        stages.forEach((s, i) => setTimeout(() =>
          push(`<span style="color:${i === stages.length - 1 ? 'var(--mint)' : 'var(--fg-soft)'}">${esc(s)}</span>`), 200 + i * 280));
        break;
      }
      case 'sudo': {
        push(`<span class="err">[sudo] password for thathsara:</span>`);
        setTimeout(() => push(`<span class="err">sudo: 3 incorrect password attempts</span>`), 400);
        setTimeout(() => push(`<span class="dim">this incident will be reported. (it won't.)</span>`), 700);
        break;
      }
      case 'rm': {
        if (rest === '-rf /' || rest === '-rf /*')
          push(`<span class="err">rm: it took the universe 13.8 billion years to make this. don't.</span>`);
        else push(`<span class="dim">rm: no.</span>`);
        break;
      }
      case 'secrets': {
        pushToast('secret unlocked', 'you found the hint trail. there is a 4th egg involving vim keys, plus a 5th nobody has found yet.');
        pushAll([
          `<span class="amber">// three things that aren't in the main page:</span>`,
          `<span style="color:var(--mint)">1.</span> <span class="dim">there's a snake game. try </span><span style="color:var(--amber)">snake</span><span class="dim"> or click the brand dot 7 times.</span>`,
          `<span style="color:var(--mint)">2.</span> <span class="dim">the konami code unlocks RED TEAM mode. ↑↑↓↓←→←→ba</span>`,
          `<span style="color:var(--mint)">3.</span> <span class="dim">type </span><span style="color:var(--amber)">coffee</span><span class="dim">. or </span><span style="color:var(--amber)">fortune</span><span class="dim">. or </span><span style="color:var(--amber)">matrix</span><span class="dim">. or any IAM action you remember.</span>`,
          `<span class="dim">(there's a 4th. it's not in this list.)</span>`,
        ]);
        break;
      }
      case 'clear': case 'cls': lines = []; break;
      case 'exit': case 'quit': mode = 'collapsed'; break;
      case 'date': push(`<span>${new Date().toString()}</span>`); break;
      case 'echo': push(`<span>${esc(rest)}</span>`); break;
      case 'pwd': push(`<span>/home/thathsara</span>`); break;
      case 'uptime': push(`<span class="dim">2y 14d, brain load 0.78 0.62 0.41</span>`); break;
      case 'man': push(`<span class="dim">No manual entry for ${esc(rest)}. We're not that fancy.</span>`); break;
      case 'iam': case 'aws':
        push(`<span class="amber">// hi, fellow AWS person.</span>`);
        push(`<span class="dim">try: <span style="color:var(--amber)">scan org-prod</span> · <span style="color:var(--amber)">cat /etc/iam.policy</span></span>`);
        break;
      case ':q': case ':q!': case ':wq':
        push(`<span style="color:var(--violet)">// you know vim. respect.</span>`);
        push(`<span class="dim">file saved (it wasn't actually saved).</span>`);
        pushToast('easter egg #4', 'ok, you found one. there are at least two more.');
        break;
      case 'kubectl':
        if (rest.startsWith('get')) {
          push(`<span style="color:var(--mint)">NAME            STATUS    AGE</span>`);
          push(`<span>portfolio-web   Running   2y14d</span>`);
          push(`<span>terminal-pod    Running   30m</span>`);
          push(`<span>easter-eggs     Running   <span class="dim">(do not delete)</span></span>`);
        } else push(`<span class="dim">try: kubectl get pods</span>`);
        break;
      case 'curl': case 'wget':
        push(`<span class="dim">${c}: this is not the internet you're looking for.</span>`); break;
      case 'hack': {
        push(`<span class="err">INITIATING HACK SEQUENCE</span>`);
        const fake = [
          '[+] enumerating targets...',
          '[+] bypassing firewall... done',
          '[+] cracking SHA-256... 100%',
          '[+] uploading payload...',
          '[!] just kidding. this is a portfolio.',
        ];
        fake.forEach((s, i) => setTimeout(() =>
          push(`<span style="color:${i < 4 ? 'var(--coral)' : 'var(--mint)'}">${esc(s)}</span>`), 200 + i * 350));
        break;
      }
      default:
        push(`<span class="err">command not found: ${esc(c)}. <span class="dim">type 'help'.</span></span>`);
    }
  }

  /* ============================================================
     INPUT HANDLING
     ============================================================ */
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') { run(input); input = ''; }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(history.length - 1, histIdx + 1);
      histIdx = next; input = history[next] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(-1, histIdx - 1);
      histIdx = next; input = next === -1 ? '' : history[next];
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const all = COMMANDS.map(([k]) => k.split(' ')[0]);
      const m = all.filter(k => k.startsWith(input));
      if (m.length === 1) input = m[0] + ' ';
      else if (m.length > 1) push(`<span class="dim">${esc(m.join('  '))}</span>`);
    } else if (e.ctrlKey && e.key === 'l') { e.preventDefault(); lines = []; }
    else if (e.ctrlKey && e.key === 'm') { e.preventDefault(); mode = mode === 'maximized' ? 'open' : 'maximized'; }
  }

  function toggleCollapse() { mode = mode === 'collapsed' ? 'open' : 'collapsed'; }
  function toggleMaximize() { mode = mode === 'maximized' ? 'open' : 'maximized'; }
</script>

<div class={`terminal ${mode === 'collapsed' ? 'collapsed' : ''} ${mode === 'maximized' ? 'maximized' : ''}`} role="region" aria-label="terminal">
  <div class="term-head" onclick={(e) => { e.stopPropagation(); if (mode === 'collapsed') mode = 'open'; }} onkeydown={() => {}} role="presentation">
    <span class="ttl">▮ terminal</span>
    <span class="hint">/dev/pts/0 · thath-sh</span>
    <span class="hint" style="color: var(--fg-faint)">· tab=complete · ↑↓=history · ctrl-l=clear</span>
    <span class="ctrls">
      <button class="ctrl" title="collapse" onclick={(e) => { e.stopPropagation(); toggleCollapse(); }}>—</button>
      <button class="ctrl" title="maximize" onclick={(e) => { e.stopPropagation(); toggleMaximize(); }}>▢</button>
    </span>
  </div>
  {#if mode !== 'collapsed'}
    <div class="term-body" bind:this={body}>
      {#each lines as l (l.id)}
        <div class="term-line">{@html l.html}</div>
      {/each}
    </div>
    <div class="term-input">
      {@html PROMPT}
      <input
        bind:this={inputEl}
        bind:value={input}
        onkeydown={onKey}
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </div>
  {/if}
</div>

<style>
  /* Most terminal styles come from global.css; tweak buttons to remove default chrome */
  .ctrl { background: none; border: none; color: inherit; font: inherit; cursor: pointer; padding: 0; }
</style>
