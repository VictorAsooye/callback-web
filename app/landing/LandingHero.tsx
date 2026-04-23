'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreSegments, type Segment } from '@/components/ScoreSegments';
import { Placeholder } from '@/components/Placeholder';
import { Icon, Icons } from '@/components/Icons';

const DEMO_JOB = {
  title: 'Senior Product Engineer',
  company: 'Folio',
  avatar: 'FO',
  salary: '$175K – $215K',
  location: 'Remote — US',
  posted: '1d ago',
};

interface SignalStep {
  label: string;
  wait: number;
  delta?: number;
  tag?: string;
  type?: 'pos' | 'neg' | 'neu';
}

const SIGNAL_STEPS: SignalStep[] = [
  { label: 'Fetching listing',         wait: 450 },
  { label: 'Extracting requirements',  wait: 600 },
  { label: 'Matching your resume',     wait: 700, delta: 38, tag: 'Resume match',     type: 'pos' },
  { label: 'Checking recency',         wait: 500, delta: 18, tag: 'Posted 1d ago',    type: 'pos' },
  { label: 'Salary alignment',         wait: 500, delta: 14, tag: 'Salary',           type: 'pos' },
  { label: 'Apply flow',               wait: 500, delta: 12, tag: 'Easy apply',       type: 'pos' },
  { label: 'Remote preference',        wait: 500, delta: 12, tag: 'Remote bonus',     type: 'pos' },
  { label: 'Seniority fit check',      wait: 600, delta: -6, tag: 'Slight level gap', type: 'neg' },
];

function PulseDot() {
  return (
    <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
      <span style={{ position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: '50%' }} />
      <span style={{ position: 'absolute', inset: -2, background: 'var(--accent)', borderRadius: '50%', opacity: 0.3, animation: 'cb-pulse 1.2s ease-out infinite' }} />
    </span>
  );
}

function LiveScoreDemo() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!running) return;
    setStep(0);
    setScore(0);
    setSegments([]);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    let t = 0;
    let runningScore = 0;
    const runningSegs: Segment[] = [];

    SIGNAL_STEPS.forEach((s, i) => {
      t += s.wait;
      timers.current.push(setTimeout(() => {
        setStep(i + 1);
        if (s.delta !== undefined && s.tag && s.type) {
          runningScore += s.delta;
          runningSegs.push({ label: s.tag, value: s.delta, type: s.type });
          setScore(runningScore);
          setSegments([...runningSegs]);
        }
      }, t));
    });

    timers.current.push(setTimeout(() => setRunning(false), t + 800));

    return () => timers.current.forEach(clearTimeout);
  }, [running]);

  return (
    <div className="card" style={{ padding: 22, boxShadow: '0 24px 60px rgba(30,28,24,.08), 0 4px 14px rgba(30,28,24,.04)' }}>
      {/* URL bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--hairline)', borderRadius: 8, marginBottom: 18, background: 'var(--surface)' }}>
        <Icon d={Icons.search} size={14} style={{ color: 'var(--ink-mute)' }} />
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          linkedin.com/jobs/view/senior-product-engineer-folio
        </div>
        <button
          onClick={() => setRunning(true)}
          disabled={running}
          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, border: '1px solid var(--hairline-strong)', background: 'var(--bg-elev)', color: 'var(--ink)', cursor: running ? 'default' : 'pointer', opacity: running ? 0.6 : 1 }}
        >
          {running ? '…scoring' : 'Re-run'}
        </button>
      </div>

      {/* Job card */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, padding: 14, background: 'var(--surface)', borderRadius: 8 }}>
        <Placeholder label={DEMO_JOB.avatar} w={44} h={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{DEMO_JOB.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{DEMO_JOB.company} · {DEMO_JOB.location}</div>
        </div>
        <ScoreRing value={score} size={58} stroke={5} />
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 14 }}>
        <ScoreSegments
          segments={segments.length ? segments : [{ label: '—', value: 0, type: 'neu' }]}
          height={6}
        />
      </div>

      {/* Signal steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SIGNAL_STEPS.map((s, i) => {
          const done = step > i;
          const active = step === i + 1 && running;
          return (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 12, opacity: done || active ? 1 : 0.35, transition: 'opacity .3s' }}
            >
              <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? 'var(--positive)' : 'var(--ink-mute)' }}>
                {done
                  ? <Icon d={Icons.check} size={12} strokeWidth={2} />
                  : active
                    ? <PulseDot />
                    : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
                }
              </div>
              <div style={{ flex: 1, color: done ? 'var(--ink)' : 'var(--ink-soft)' }}>{s.label}</div>
              {s.delta !== undefined && done && (
                <span className="mono" style={{ color: s.type === 'neg' ? 'var(--penalty)' : 'var(--positive)', fontSize: 11 }}>
                  {s.delta > 0 ? '+' : ''}{s.delta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section style={{ padding: '80px 40px 60px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
      <div>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', background: 'var(--surface)', borderRadius: 999, fontSize: 12, color: 'var(--ink-soft)', marginBottom: 28 }}>
          <span style={{ padding: '2px 7px', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>New</span>
          <span>Live TestFlight · 2,400+ users</span>
        </div>

        <h1 className="serif" style={{ fontSize: 72, lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 24 }}>
          Know your odds<br />
          <em style={{ color: 'var(--ink-mute)', fontStyle: 'italic' }}>before</em> you apply.
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--ink-soft)', maxWidth: 460, marginBottom: 32 }}>
          Callback scores every listing 0&nbsp;–&nbsp;100 for your exact resume. Skip the 47 that won&apos;t answer. Spend your afternoon on the 3 that will.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <Link href="/sign-up" className="btn btn-primary">
            Get started free <Icon d={Icons.arrow} size={14} />
          </Link>
          <Link href="#how-it-works" className="btn btn-ghost">
            How it works
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 32, fontSize: 12, color: 'var(--ink-mute)' }}>
          <div className="mono">
            <span style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 2 }}>10K+</span>
            listings scanned daily
          </div>
          <div className="mono">
            <span style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 2 }}>3.7×</span>
            callback rate vs. apply-blind
          </div>
          <div className="mono">
            <span style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 2 }}>50&nbsp;pts</span>
            weight on resume match
          </div>
        </div>
      </div>

      <LiveScoreDemo />
    </section>
  );
}
