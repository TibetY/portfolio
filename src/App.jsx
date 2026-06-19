import { useEffect, useRef, useState } from 'react';
import './App.css';

const HERO_NAME = 'MARCUS REED';
const EMAIL = 'marcus@reed.sh';
const GITHUB_URL = 'https://github.com';
const PGP_URL = '#';

const THEME_VARS = {
  dark: { bg: '#0a0b0c', panel: '#101316', border: '#21262c', text: '#e9e7e0', dim: '#71767c' },
  light: { bg: '#f3f2ee', panel: '#ffffff', border: '#dbd9d2', text: '#16181a', dim: '#73777c' },
};

const PROJECTS = [
  {
    id: '01',
    name: 'PACKETWEAVE',
    blurb: 'real-time traffic visualizer w/ deep-packet inspection',
    tags: ['Go', 'eBPF', 'WebGL'],
    detail:
      'Taps the kernel with eBPF probes and streams flows into a force-directed WebGL graph. Lets you watch a network breathe — and spot the one host that shouldn’t be talking to that one port.',
    ascii: '  host ──▶ flow ──▶ graph\n   │        │        │\n  eBPF    decode    WebGL\n   └─ 1.2M pkts/s ◀──┘',
  },
  {
    id: '02',
    name: 'NULLROUTE',
    blurb: 'C2 beacon detection from passive DNS + JA3',
    tags: ['Python', 'Suricata', 'ML'],
    detail:
      'A heuristics + light-ML engine that flags command-and-control beaconing by jitter analysis and TLS fingerprint clustering. Ships as a Suricata sidecar. Caught three live samples in testing.',
    ascii: '  pcap ▶ features ▶ score\n  ▒▒▒░░  jitter  ░░▒▒▒\n  JA3 ─┐\n  pDNS ┴▶ cluster ▶ alert',
  },
  {
    id: '03',
    name: 'CRT-9',
    blurb: 'self-hosted CTF framework — challenges as containers',
    tags: ['Rust', 'Docker', 'WASM'],
    detail:
      'Every challenge is a signed container; the scoreboard is a single Rust binary. Built it to run a 200-player event off one cheap VPS without it falling over. It didn’t.',
    ascii: '  [chal]──sign──▶[registry]\n     │                │\n  spawn◀──── scoreboard(rs)\n     └──▶ 200 players ok',
  },
  {
    id: '04',
    name: 'GHOSTKEY',
    blurb: 'air-gapped password vault on a $4 microcontroller',
    tags: ['Rust', 'embedded', 'crypto'],
    detail:
      'A hardware password manager experiment: secrets never leave the chip, entry is a rotary dial, and it emulates a USB keyboard to type them. Mostly an excuse to write no_std Rust on bare metal.',
    ascii: '  dial ▶ derive ▶ HID type\n   ╭─────────────╮\n   │  no_std rs  │ air-gap\n   ╰─────────────╯',
  },
  {
    id: '05',
    name: 'SIGINT-LAB',
    blurb: 'SDR signal classifier — what is that thing transmitting?',
    tags: ['Python', 'GNURadio', 'SDR'],
    detail:
      'Point an RTL-SDR at the spectrum and it labels modulation schemes in near-real-time. Current obsession: telling apart the dozen proprietary protocols my neighbourhood’s smart meters use.',
    ascii: '  RF ▶ FFT ▶ CNN ▶ label\n  ∿∿∿∿  ▁▃▅▇▅▃▁  FSK?\n  433.92 MHz · −62 dBm',
  },
];

const MENU_W = 216;
const MENU_H = 220;

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('av_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [hovered, setHovered] = useState(null);
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const ringRef = useRef(null);
  const echoRef = useRef(null);
  const dotRef = useRef(null);
  const menuRef = useRef(null);
  const copyTimerRef = useRef(null);
  const noclipTimerRef = useRef(null);

  // ---------- theme ----------
  useEffect(() => {
    const t = THEME_VARS[theme];
    const el = document.documentElement;
    el.style.setProperty('--bg', t.bg);
    el.style.setProperty('--panel', t.panel);
    el.style.setProperty('--border', t.border);
    el.style.setProperty('--text', t.text);
    el.style.setProperty('--dim', t.dim);
    el.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    try {
      localStorage.setItem('av_theme', theme);
    } catch {
      /* localStorage unavailable */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // ---------- name decode ----------
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const glyphs = '!<>-_\\/[]{}=+*^?#01__';
    let frame = 0;
    const total = 38;
    const timer = setInterval(() => {
      let out = '';
      for (let i = 0; i < HERO_NAME.length; i++) {
        if (HERO_NAME[i] === ' ') {
          out += ' ';
          continue;
        }
        const revealAt = (i / HERO_NAME.length) * (total * 0.6) + 6;
        out += frame >= revealAt ? HERO_NAME[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      frame++;
      if (frame > total) {
        el.textContent = HERO_NAME;
        clearInterval(timer);
      }
    }, 32);
    return () => clearInterval(timer);
  }, []);

  // ---------- custom cursor ----------
  useEffect(() => {
    if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
    const ring = ringRef.current, echo = echoRef.current, dot = dotRef.current;
    if (!ring || !echo || !dot) return;
    [ring, echo, dot].forEach((e) => (e.style.display = 'block'));
    document.body.style.cursor = 'none';

    const m = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = { x: m.x, y: m.y }, e1 = { x: m.x, y: m.y }, d = { x: m.x, y: m.y };
    let hot = false;
    let raf;

    const onMove = (ev) => {
      m.x = ev.clientX;
      m.y = ev.clientY;
      const t = ev.target;
      hot = !!(t && t.closest && t.closest('a,button,[data-int]'));
    };
    window.addEventListener('mousemove', onMove);

    const loop = () => {
      r.x += (m.x - r.x) * 0.3;
      r.y += (m.y - r.y) * 0.3;
      e1.x += (r.x - e1.x) * 0.16;
      e1.y += (r.y - e1.y) * 0.16;
      d.x += (m.x - d.x) * 0.55;
      d.y += (m.y - d.y) * 0.55;
      const s = hot ? 1.9 : 1;
      ring.style.transform = `translate(${r.x}px,${r.y}px) translate(-50%,-50%) scale(${s})`;
      ring.style.opacity = hot ? '1' : '0.85';
      echo.style.transform = `translate(${e1.x}px,${e1.y}px) translate(-50%,-50%) scale(${hot ? 1.9 : 1})`;
      dot.style.transform = `translate(${d.x}px,${d.y}px) translate(-50%,-50%)`;
      dot.style.opacity = hot ? '0' : '1';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.body.style.cursor = '';
      [ring, echo, dot].forEach((e) => (e.style.display = 'none'));
    };
  }, []);

  // ---------- context menu ----------
  useEffect(() => {
    const onCtx = (ev) => {
      ev.preventDefault();
      let x = ev.clientX, y = ev.clientY;
      if (x + MENU_W > window.innerWidth) x = window.innerWidth - MENU_W - 8;
      if (y + MENU_H > window.innerHeight) y = window.innerHeight - MENU_H - 8;
      setMenu({ visible: true, x, y });
    };
    const onClick = (ev) => {
      const menuEl = menuRef.current;
      setMenu((m) => (m.visible && menuEl && !menuEl.contains(ev.target) ? { ...m, visible: false } : m));
    };
    const onKey = (ev) => {
      if (ev.key === 'Escape') setMenu((m) => ({ ...m, visible: false }));
    };
    window.addEventListener('contextmenu', onCtx);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('contextmenu', onCtx);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(copyTimerRef.current);
    clearTimeout(noclipTimerRef.current);
  }, []);

  const closeMenu = () => setMenu((m) => ({ ...m, visible: false }));

  const copyEmail = () => {
    try {
      navigator.clipboard.writeText(EMAIL).catch(() => {});
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1600);
  };
  const menuCopy = () => { copyEmail(); closeMenu(); };
  const menuGithub = () => { window.open(GITHUB_URL, '_blank'); closeMenu(); };
  const menuTheme = () => { toggleTheme(); closeMenu(); };
  const menuNoclip = () => {
    closeMenu();
    const root = rootRef.current;
    if (!root) return;
    root.style.animation = 'av-glitch .5s steps(2) 2';
    root.style.filter = 'invert(1) hue-rotate(90deg)';
    clearTimeout(noclipTimerRef.current);
    noclipTimerRef.current = setTimeout(() => {
      root.style.animation = '';
      root.style.filter = '';
    }, 1100);
  };

  const projectCount = String(PROJECTS.length).padStart(2, '0');

  return (
    <div ref={rootRef} className="app-root">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar__path">
          <span className="accent">~/</span>mreed<span className="blink">_</span>
        </div>
        <div className="topbar__right">
          <div className="topbar__status" data-int="true">
            <span className="status-dot" />available for work
          </div>
          <button onClick={toggleTheme} data-int="true" className="theme-btn">
            {theme === 'dark' ? '◐ dark' : '◑ light'}
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero__decrypt">
          &gt; decrypting identity<span className="blink">_</span>
        </div>
        <h1 ref={nameRef} className="hero__name">{HERO_NAME}</h1>
        <p className="hero__subtitle">
          Software developer working in cyber security &amp; intelligence. I build things that probe, defend, and occasionally break — then write down how.
        </p>
        <div className="hero__tags">
          <span className="pill">software dev</span>
          <span className="pill">security &amp; research</span>
          <span className="pill">ctf / offensive</span>
          <span className="pill">experiments</span>
        </div>
        <div className="hero__hint">
          <span>scroll ↓</span>
          <span>try right-click anywhere</span>
        </div>
      </section>

      {/* WHOAMI */}
      <section className="section">
        <div className="section__label">// whoami</div>
        <div className="whoami__grid">
          <p className="whoami__text">
            I'm a 33-year-old developer who got into this field because taking systems apart is the fastest way to understand them. Most of what I make starts as a question I couldn't stop poking at — a protocol that looked fragile, a box I wanted to own, a workflow that deserved to be automated. This is the archive of where that went.
          </p>
          <div className="whoami__stats">
            <div className="stat-row"><span className="stat-row__label">focus</span><span>offensive sec · tooling</span></div>
            <div className="stat-row"><span className="stat-row__label">stack</span><span>Rust · Go · Python</span></div>
            <div className="stat-row"><span className="stat-row__label">currently</span><span>SDR + signal analysis</span></div>
            <div className="stat-row"><span className="stat-row__label">off-hours</span><span>CTFs · lockpicking</span></div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section">
        <div className="projects__header">
          <div className="projects__label">ls ./projects</div>
          <div className="projects__count">{projectCount} entries · hover to expand</div>
        </div>
        <div className="project-list">
          {PROJECTS.map((p, i) => {
            const open = hovered === i;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onClick={() => setHovered((h) => (h === i ? null : i))}
                data-int="true"
                className="project-row"
                style={{ background: open ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'transparent' }}
              >
                <div className="project-row__main">
                  <span className="project-id">{p.id}</span>
                  <span className="project-name">{p.name}</span>
                  <span className="project-blurb">{p.blurb}</span>
                  <div className="project-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <span className="project-glyph">{open ? '–' : '+'}</span>
                </div>
                {open && (
                  <div className="project-detail">
                    <div>
                      <p className="project-detail__text">{p.detail}</p>
                      <div className="project-detail__links">
                        <span className="project-link--accent">view source →</span>
                        <span className="project-link--dim">read writeup →</span>
                      </div>
                    </div>
                    <div className="project-detail__ascii">{p.ascii}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section className="section contact-section">
        <div className="contact-panel">
          <div className="contact-panel__label">
            &gt; establish_contact<span className="blink">_</span>
          </div>
          <h2 className="contact-panel__heading">Got something that needs building, breaking, or defending?</h2>
          <div className="contact-panel__actions">
            <button onClick={copyEmail} data-int="true" className="btn-primary">
              {copied ? '✓ copied to clipboard' : 'copy email →'}
            </button>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" data-int="true" className="btn-secondary">github ↗</a>
            <a href={PGP_URL} data-int="true" className="btn-secondary">PGP key ↗</a>
          </div>
        </div>
        <div className="footer-row">
          <span>© 2026 marcus reed — built in the void</span>
          <span>no trackers · no cookies · no nonsense</span>
        </div>
      </section>

      {/* SCANLINE OVERLAY */}
      <div className="scanline-overlay" />

      {/* CUSTOM CURSOR */}
      <div ref={echoRef} className="cursor-echo" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />

      {/* CONTEXT MENU */}
      <div
        ref={menuRef}
        className="context-menu"
        style={{ display: menu.visible ? 'block' : 'none', left: menu.x, top: menu.y }}
      >
        <div className="context-menu__title">ROOT@MREED:~$</div>
        <button onClick={menuCopy} data-int="true" className="context-menu__item">
          <span className="glyph">$</span>copy email
        </button>
        <button onClick={menuGithub} data-int="true" className="context-menu__item">
          <span className="glyph">$</span>open github
        </button>
        <button onClick={menuTheme} data-int="true" className="context-menu__item">
          <span className="glyph">$</span>toggle theme
        </button>
        <div className="context-menu__divider" />
        <button onClick={menuNoclip} data-int="true" className="context-menu__item context-menu__item--noclip">
          <span className="glyph">#</span>noclip<span className="hint">easter egg</span>
        </button>
      </div>
    </div>
  );
}

export default App;
