'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WebSidebar } from '@/components/WebSidebar';
import { Icon, Icons } from '@/components/Icons';
import { useAuthStore } from '@/store/authStore';
import { getSupabaseClient } from '@/lib/supabase';

const STEPS = [
  { label: 'Parsing document',        key: 'parsing' },
  { label: 'Extracting skills',       key: 'extracting' },
  { label: 'Mapping aliases',         key: 'aliases' },
  { label: 'Scoring seniority level', key: 'seniority' },
  { label: 'Building your profile',   key: 'profile' },
];

const STEP_DELAYS = [800, 1400, 2200, 3000, 4000];
const TOTAL_MS = 5500;

export default function ResumeProcessingPage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [aliasNote, setAliasNote] = useState<string | null>(null);

  useEffect(() => {
    // Advance steps progressively
    const timers = STEP_DELAYS.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    );
    const doneTimer = setTimeout(() => setDone(true), TOTAL_MS);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneTimer); };
  }, []);

  useEffect(() => {
    // Load extracted skills from Supabase once processing starts
    async function loadSkills() {
      if (!session) return;
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', session.user.id)
        .single();
      if (data?.preferences) {
        const prefs = data.preferences as { skills?: string[] };
        const skills = prefs.skills ?? [];
        setExtractedSkills(skills);
        if (skills.length > 0) {
          setAliasNote('Alias-aware matching active — K8s counts as Kubernetes, JS as JavaScript.');
        }
      }
    }
    // Load after a brief delay to let the server-side extraction finish
    const t = setTimeout(loadSkills, 2500);
    return () => clearTimeout(t);
  }, [session]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="resume" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Resume</div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {done ? (
              <>
                <span style={{ color: 'var(--positive)', display: 'inline-flex' }}>
                  <Icon d={Icons.check} size={20} strokeWidth={2.5} />
                </span>
                Resume analysed.
              </>
            ) : 'Analysing your resume…'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
          <div style={{ maxWidth: 580, width: '100%', display: 'flex', gap: 40 }}>

            {/* Progress steps */}
            <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: 0, paddingTop: 4 }}>
              {STEPS.map((s, i) => {
                const isDone = step > i;
                const isActive = step === i + 1;
                return (
                  <div key={s.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 20, position: 'relative' }}>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        position: 'absolute', left: 11, top: 24, bottom: 0, width: 1,
                        background: isDone ? 'var(--positive)' : 'var(--hairline)',
                        transition: 'background 0.4s',
                      }} />
                    )}
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? 'var(--positive)' : isActive ? 'var(--accent)' : 'var(--surface)',
                      border: isDone || isActive ? 'none' : '1px solid var(--hairline-strong)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.3s',
                    }}>
                      {isDone ? (
                        <Icon d={Icons.check} size={12} strokeWidth={2.5} style={{ color: 'var(--bg)' }} />
                      ) : isActive ? (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg)', animation: 'cb-pulse 1.2s ease-out infinite' }} />
                      ) : null}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: isDone ? 'var(--ink)' : 'var(--ink-mute)',
                      paddingTop: 2,
                      fontWeight: isDone ? 500 : 400,
                      transition: 'color 0.3s',
                    }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Extracted skills preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '18px 20px' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Extracted so far
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon d={Icons.sparkle} size={13} style={{ color: 'var(--accent)' }} />
                  {extractedSkills.length > 0
                    ? `${extractedSkills.length} skills extracted`
                    : 'Scanning resume…'
                  }
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, minHeight: 60 }}>
                  {extractedSkills.map((s, i) => (
                    <span
                      key={s}
                      className="chip match"
                      style={{
                        opacity: i < step * 2.5 ? 1 : 0.3,
                        transition: 'opacity 0.4s',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Icon d={Icons.check} size={10} strokeWidth={2.4} />
                      {s}
                    </span>
                  ))}
                  {extractedSkills.length === 0 && step > 0 && (
                    <div style={{ width: '100%', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: 24, borderRadius: 999, background: 'var(--surface)', width: 60 + (i % 3) * 20, animation: 'none', opacity: 0.4 }} />
                      ))}
                    </div>
                  )}
                </div>

                {aliasNote && (
                  <div style={{ padding: '10px 12px', background: 'var(--accent-soft)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Auto-mapped:</span> {aliasNote}
                  </div>
                )}
              </div>

              {!done && (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 10, fontSize: 12, color: 'var(--ink-mute)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)', animation: 'cb-pulse 1.5s ease-out infinite', flexShrink: 0 }} />
                  Analysing your resume — this takes a few seconds…
                </div>
              )}

              {done && (
                <Link
                  href="/discover"
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', height: 48, fontSize: 14, textDecoration: 'none', animation: 'cb-fade-in 0.4s ease-out' }}
                >
                  <Icon d={Icons.sparkle} size={14} />
                  View my ranked feed
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
