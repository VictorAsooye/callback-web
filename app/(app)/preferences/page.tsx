'use client';

import React, { useState, useEffect } from 'react';
import { WebSidebar } from '@/components/WebSidebar';
import { Icon, Icons } from '@/components/Icons';
import { useAuthStore } from '@/store/authStore';
import { getSupabaseClient } from '@/lib/supabase';
import type { UserPreferences, ClearanceLevel } from '@/lib/score';

const CLEARANCE_OPTS: { label: string; value: ClearanceLevel }[] = [
  { label: 'None', value: 'none' },
  { label: 'Public Trust', value: 'public-trust' },
  { label: 'Secret', value: 'secret' },
  { label: 'Top Secret', value: 'top-secret' },
  { label: 'TS/SCI', value: 'ts-sci' },
];

const REMOTE_OPTS = [
  { label: 'Remote only', value: true },
  { label: 'Preferred', value: 'preferred' },
  { label: 'Hybrid ok', value: 'hybrid' },
  { label: 'On-site ok', value: false },
];

export default function PreferencesPage() {
  const { session } = useAuthStore();
  const [prefs, setPrefs] = useState<UserPreferences & { targetRole?: string }>({ skills: [], wantsRemote: false });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [desiredCities, setDesiredCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [clearance, setClearance] = useState<ClearanceLevel>('none');
  const [wantsRemote, setWantsRemote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedState] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ name?: string; uploadedAt?: string; skillCount?: number } | null>(null);

  useEffect(() => {
    async function load() {
      if (!session) return;
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('users')
        .select('preferences, resume_text, resume_name, resume_uploaded_at')
        .eq('id', session.user.id)
        .single();
      if (!data) return;
      const p = data.preferences as (UserPreferences & { targetRole?: string }) | null;
      if (p) {
        setPrefs(p);
        setSkills(p.skills ?? []);
        setTargetRole((p as { targetRole?: string }).targetRole ?? '');
        setYearsExp(p.yearsExperience ? String(p.yearsExperience) : '');
        setMinSalary(p.minSalary ? String(p.minSalary) : '');
        setDesiredCities(p.desiredLocations ?? []);
        setClearance(p.clearanceLevel ?? 'none');
        setWantsRemote(p.wantsRemote ?? false);
      }
      if (data.resume_text) {
        setResumeInfo({
          name: (data.resume_name as string | undefined) ?? 'Resume.pdf',
          uploadedAt: (data.resume_uploaded_at as string | undefined),
          skillCount: (p?.skills ?? []).length,
        });
      }
    }
    load();
  }, [session]);

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    const updatedPrefs: UserPreferences & { targetRole?: string } = {
      skills,
      wantsRemote,
      targetRole: targetRole || undefined,
      yearsExperience: yearsExp ? Number(yearsExp) : undefined,
      minSalary: minSalary ? Number(minSalary) : undefined,
      desiredLocations: desiredCities,
      clearanceLevel: clearance,
    };
    const supabase = getSupabaseClient();
    await supabase.from('users').upsert({ id: session.user.id, preferences: updatedPrefs });
    setSaving(false);
    setSavedState(true);
    setTimeout(() => setSavedState(false), 2000);
  }

  function addSkill() {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setNewSkill('');
  }

  function removeSkill(s: string) {
    setSkills(skills.filter(x => x !== s));
  }

  function addCity() {
    const c = newCity.trim();
    if (c && !desiredCities.includes(c)) {
      setDesiredCities([...desiredCities, c]);
    }
    setNewCity('');
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="preferences" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Settings</div>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Preferences</div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, opacity: saving ? 0.7 : 1 }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Resume */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 3, color: 'var(--ink)' }}>Resume</h3>
                  <p style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Used for skill extraction and resume tailoring. Never shared.</p>
                </div>
                <a href="/resume" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12, textDecoration: 'none' }}>
                  <Icon d={Icons.upload} size={13} /> {resumeInfo ? 'Replace' : 'Upload'}
                </a>
              </div>
              {resumeInfo ? (
                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 48, background: 'var(--accent-soft)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={Icons.upload} size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{resumeInfo.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                      {resumeInfo.uploadedAt && `Uploaded ${new Date(resumeInfo.uploadedAt).toLocaleDateString()} · `}
                      {resumeInfo.skillCount} skills extracted
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', background: 'var(--positive-soft)', borderRadius: 999, fontSize: 11, color: 'var(--positive)', fontWeight: 500 }}>Active</div>
                </div>
              ) : (
                <div style={{ padding: '24px', borderRadius: 10, border: '1.5px dashed var(--hairline-strong)', textAlign: 'center', fontSize: 13, color: 'var(--ink-mute)' }}>
                  No resume uploaded yet.{' '}
                  <a href="/resume" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Upload now →</a>
                </div>
              )}
            </section>

            <div style={{ height: 1, background: 'var(--hairline)' }} />

            {/* Skills */}
            <section>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 3, color: 'var(--ink)' }}>Skills</h3>
                <p style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Auto-extracted from your resume. Alias-aware — K8s = Kubernetes. Click to remove.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {skills.map(s => (
                  <span
                    key={s}
                    className="chip match"
                    style={{ gap: 8, padding: '6px 6px 6px 12px', cursor: 'pointer' }}
                    onClick={() => removeSkill(s)}
                  >
                    {s}
                    <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)' }}>
                      <Icon d={Icons.x} size={10} strokeWidth={2} />
                    </span>
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Add skill…"
                    style={{ width: 120, padding: '4px 10px', fontSize: 12, borderRadius: 999, border: '1px dashed var(--hairline-strong)', background: 'transparent' }}
                  />
                  <button onClick={addSkill} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>+</button>
                </div>
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--hairline)' }} />

            {/* Role & experience */}
            <section>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: 'var(--ink)' }}>Role &amp; experience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Target title</label>
                  <input
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Years of experience</label>
                  <input
                    type="number"
                    value={yearsExp}
                    onChange={e => setYearsExp(e.target.value)}
                    placeholder="6"
                    min={0}
                    max={50}
                  />
                </div>
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--hairline)' }} />

            {/* Compensation & Location */}
            <section>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: 'var(--ink)' }}>Compensation &amp; location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Salary floor</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-mute)', fontSize: 13 }}>$</span>
                    <input
                      type="number"
                      value={minSalary}
                      onChange={e => setMinSalary(e.target.value)}
                      placeholder="165000"
                      style={{ paddingLeft: 24 }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 5 }}>Jobs below this lose points. No salary listed = neutral.</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Remote preference</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {REMOTE_OPTS.map((opt) => {
                      const isActive = opt.value === true ? wantsRemote : !wantsRemote && opt.value === false;
                      return (
                        <button
                          key={String(opt.value)}
                          onClick={() => setWantsRemote(opt.value === true)}
                          style={{
                            flex: 1, padding: '10px 6px', borderRadius: 8, fontSize: 11,
                            border: isActive ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                            background: isActive ? 'var(--ink)' : 'transparent',
                            color: isActive ? 'var(--bg)' : 'var(--ink-soft)',
                            cursor: 'pointer', fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preferred cities */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>
                  Preferred cities / states{' '}
                  <span style={{ color: 'var(--positive)', fontWeight: 500 }}>+8 pts each</span>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {desiredCities.map(c => (
                    <span
                      key={c}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 12px', borderRadius: 999, fontSize: 12, border: '1px solid color-mix(in oklch, var(--warn) 40%, transparent)', background: 'color-mix(in oklch, var(--warn) 10%, transparent)', color: 'var(--warn)', cursor: 'pointer' }}
                      onClick={() => setDesiredCities(desiredCities.filter(x => x !== c))}
                    >
                      {c}
                      <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon d={Icons.x} size={9} strokeWidth={2} />
                      </span>
                    </span>
                  ))}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCity()}
                      placeholder="Austin, TX"
                      style={{ width: 130, padding: '6px 12px', fontSize: 12, borderRadius: 999, border: '1px dashed var(--hairline-strong)', background: 'transparent' }}
                    />
                    <button onClick={addCity} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, borderRadius: 999 }}>+</button>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--hairline)' }} />

            {/* Security clearance */}
            <section>
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 3, color: 'var(--ink)' }}>Security clearance</h3>
                <p style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Cleared roles earn +12 pts. Unmet requirements cost −5 to −20 pts depending on sponsorship.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CLEARANCE_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setClearance(opt.value)}
                    style={{
                      padding: '9px 16px', borderRadius: 8, fontSize: 13,
                      border: clearance === opt.value ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                      background: clearance === opt.value ? 'var(--ink)' : 'transparent',
                      color: clearance === opt.value ? 'var(--bg)' : 'var(--ink-soft)',
                      cursor: 'pointer', fontWeight: clearance === opt.value ? 500 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--ink-mute)' }}>
                {clearance === 'none' ? 'Not set — no effect on scoring until you select a level.' : `You hold ${CLEARANCE_OPTS.find(o => o.value === clearance)?.label} clearance.`}
              </div>
            </section>

            <div style={{ height: 40 }} />
          </div>
        </div>
      </main>
    </div>
  );
}
