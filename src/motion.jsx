import React, { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ *
 *  Motion primitives — one rAF loop, one scroll listener, shared.
 * ------------------------------------------------------------------ */

export const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fine = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer:fine)').matches;

const subs = new Set();
let ticking = false;

function flush() {
  ticking = false;
  const y = window.scrollY || 0;
  subs.forEach(fn => fn(y));
}

function schedule() {
  if (!ticking) { ticking = true; requestAnimationFrame(flush); }
}

/** Subscribe to a rAF-throttled scroll/resize signal. */
export function useScroll(cb) {
  const latest = useRef(cb);
  latest.current = cb;
  useEffect(() => {
    const fn = y => latest.current(y);
    subs.add(fn);
    if (subs.size === 1) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    fn(window.scrollY || 0);
    return () => {
      subs.delete(fn);
      if (!subs.size) window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
}

/** Drifts an element against the scroll. Pair with an overflow-hidden parent. */
export function useParallax(strength = 0.1, scale = 1.16) {
  const el = useRef(null);
  useScroll(() => {
    const node = el.current;
    if (!node || reduced()) return;
    const r = node.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    const offset = r.top + r.height / 2 - window.innerHeight / 2;
    node.style.transform =
      `translate3d(0, ${(-offset * strength).toFixed(2)}px, 0) scale(${scale})`;
  });
  return el;
}

/** Pulls an element gently toward the cursor while hovered. */
export function useMagnetic(power = 0.24) {
  const el = useRef(null);
  useEffect(() => {
    const node = el.current;
    if (!node || reduced() || !fine()) return;
    const move = e => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * power;
      const y = (e.clientY - r.top - r.height / 2) * power;
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    const reset = () => { node.style.transform = ''; };
    node.addEventListener('mousemove', move);
    node.addEventListener('mouseleave', reset);
    return () => {
      node.removeEventListener('mousemove', move);
      node.removeEventListener('mouseleave', reset);
    };
  }, [power]);
  return el;
}

/** Adds .in-view once, then stops watching. */
export function useReveal(threshold = 0.14) {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal:not(.in-view)');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(n => n.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      });
    }, { threshold, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
  }, [threshold]);
}

/* ------------------------------------------------------------------ *
 *  Components
 * ------------------------------------------------------------------ */

/**
 * Masked, word-by-word headline reveal.
 * lines: array of strings, or { t, em } to tint a line with the accent.
 */
export function SplitText({ lines, tag: Tag = 'h2', className = '', delay = 0 }) {
  let i = 0;
  return (
    <Tag className={`split reveal ${className}`}>
      {lines.map((line, li) => {
        const text = typeof line === 'string' ? line : line.t;
        const em = typeof line === 'object' && line.em;
        return (
          <span className={`split-line${em ? ' is-em' : ''}`} key={li}>
            {text.split(' ').map((word, wi) => (
              <span className="split-word" key={wi}>
                <span style={{ '--i': i++, '--delay': `${delay}ms` }}>{word}</span>
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}

/** Seamless ticker. Content is duplicated so the loop never shows a seam. */
export function Marquee({ items, speed = 42, reverse = false }) {
  const run = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div
        className={`marquee-track${reverse ? ' is-reverse' : ''}`}
        style={{ '--speed': `${speed}s` }}
      >
        {run.map((item, i) => (
          <span key={i}>{item}<i>{'✦'}</i></span>
        ))}
      </div>
    </div>
  );
}

/** Soft trailing cursor, desktop + fine pointer only. */
export function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    if (reduced() || !fine()) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y, raf = 0;

    const move = e => {
      x = e.clientX; y = e.clientY;
      document.body.classList.add('has-cursor');
    };
    const over = e => {
      const hit = e.target.closest('a, button, [data-cursor]');
      document.body.classList.toggle('cursor-active', !!hit);
      if (ring.current) ring.current.dataset.label = (hit && hit.getAttribute('data-cursor')) || '';
    };
    const down = () => document.body.classList.add('cursor-down');
    const up = () => document.body.classList.remove('cursor-down');
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.body.classList.remove('has-cursor', 'cursor-active', 'cursor-down');
    };
  }, []);
  return <><div className="cursor-dot" ref={dot} /><div className="cursor-ring" ref={ring} /></>;
}

/** Opening curtain. Resolves immediately when motion is reduced. */
export function useIntro(duration = 1500) {
  const [stage, setStage] = useState(() => (reduced() ? 'done' : 'in'));
  useEffect(() => {
    if (stage === 'done') return;
    document.body.classList.add('is-loading');
    const lift = setTimeout(() => setStage('out'), duration);
    const clear = setTimeout(() => {
      setStage('done');
      document.body.classList.remove('is-loading');
    }, duration + 950);
    return () => { clearTimeout(lift); clearTimeout(clear); };
  }, []);
  return stage;
}

export function Intro({ stage }) {
  if (stage === 'done') return null;
  return (
    <div className={`intro${stage === 'out' ? ' is-out' : ''}`} aria-hidden="true">
      <div className="intro-panel" />
      <div className="intro-panel" />
      <div className="intro-panel" />
      <div className="intro-mark">
        <span className="intro-word">CALAS <i>BROWS</i></span>
        <span className="intro-sub">BROW &amp; LASH ARTISTRY</span>
        <span className="intro-bar"><i /></span>
      </div>
    </div>
  );
}
