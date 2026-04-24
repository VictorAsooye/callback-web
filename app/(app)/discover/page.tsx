'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WebSidebar } from '@/components/WebSidebar';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreSegments, type Segment } from '@/components/ScoreSegments';
import { Placeholder } from '@/components/Placeholder';
import { Chip } from '@/components/Chip';
import { Icon, Icons } from '@/components/Icons';
import { useJobs, type ScoredJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';
import { saveJobById } from '@/lib/jobsCache';

function formatPostedDate(postedAt: string | null): string {
  if (!postedAt) return 'Unknown';
  const daysAgo = (Date.now() - new Date(postedAt).getTime()) / 86_400_000;
  if (isNaN(daysAgo)) return 'Unknown';
  if (daysAgo < 1) {
    const hoursAgo = Math.round(daysAgo * 24);
    return `${hoursAgo}h ago`;
  }
  if (daysAgo < 30) return `${Math.round(daysAgo)}d ago`;
  return new Date(postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function jobToSegments(job: ScoredJob): Segment[] {
  const segs: Segment[] = [];
  if (job.scoreBreakdown.keywordMatch > 0) segs.push({ label: 'Resume match', value: job.scoreBreakdown.keywordMatch, type: 'pos' });
  if (job.scoreBreakdown.recency > 0) segs.push({ label: 'Recency', value: job.scoreBreakdown.recency, type: 'pos' });
  if ((job.scoreBreakdown.salaryMatch ?? 0) > 0) segs.push({ label: 'Salary', value: job.scoreBreakdown.salaryMatch!, type: 'pos' });
  if (job.scoreBreakdown.applyQuality > 0) segs.push({ label: 'Easy apply', value: job.scoreBreakdown.applyQuality, type: 'pos' });
  if (job.scoreBreakdown.remoteMatch > 0) segs.push({ label: 'Remote', value: job.scoreBreakdown.remoteMatch, type: 'pos' });
  if (job.scoreBreakdown.locationBonus > 0) segs.push({ label: 'City match', value: job.scoreBreakdown.locationBonus, type: 'pos' });
  if (job.scoreBreakdown.clearanceBonus > 0) segs.push({ label: 'Clearance', value: job.scoreBreakdown.clearanceBonus, type: 'pos' });
  if (job.scoreBreakdown.seniorityPenalty > 0) segs.push({ label: 'Seniority gap', value: -job.scoreBreakdown.seniorityPenalty, type: 'neg' });
  if (job.scoreBreakdown.locationPenalty > 0) segs.push({ label: 'Distance', value: -job.scoreBreakdown.locationPenalty, type: 'neg' });
  if (job.scoreBreakdown.clearancePenalty > 0) segs.push({ label: 'Clearance req.', value: -job.scoreBreakdown.clearancePenalty, type: 'neg' });
  if (job.scoreBreakdown.isRepost) segs.push({ label: 'Repost', value: -10, type: 'neg' });
  return segs.length > 0 ? segs : [{ label: '—', value: 1, type: 'neu' }];
}

function getMatchedSkills(job: ScoredJob, userSkills: string[]): { matched: string[]; missing: string[] } {
  if (!userSkills.length || !job.qualificationSkills) {
    return { matched: [], missing: [] };
  }
  const matched = userSkills.filter(s =>
    job.qualificationSkills!.some(qs => qs.toLowerCase() === s.toLowerCase())
  ).slice(0, 5);
  const missing = job.qualificationSkills
    .filter(qs => !userSkills.some(us => us.toLowerCase() === qs.toLowerCase()))
    .slice(0, 3);
  return { matched, missing };
}

function JobCard({ job, userSkills }: { job: ScoredJob; userSkills: string[] }) {
  const segments = jobToSegments(job);
  const { matched, missing } = getMatchedSkills(job, userSkills);
  const avatarLabel = job.company.split(' ').map(w => w[0]).slice(0, 2).join('');
  const posted = formatPostedDate(job.posted_at);
  const router = useRouter();

  function handleClick() {
    saveJobById(job.source_id, job);
    router.push(`/job/${job.source_id}`);
  }

  return (
    <div
      onClick={handleClick}
      style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
    >
      <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--hairline-strong)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
      >
        {/* Header row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
          <Placeholder label={avatarLabel} w={60} h={60} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 5, letterSpacing: '0.01em' }}>
              {job.company}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {job.title}
            </div>
          </div>
          <ScoreRing value={job.score} size={72} stroke={6} />
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {job.location && (
            <span className="chip" style={{ fontSize: 12 }}>
              <Icon d={Icons.loc} size={11} />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="chip" style={{ fontSize: 12 }}>
              <Icon d={Icons.cash} size={11} />
              {job.salary}
            </span>
          )}
          <span className="chip" style={{ fontSize: 12 }}>
            <Icon d={Icons.clock} size={11} />
            {posted}
          </span>
          {job.remote && (
            <span className="chip warn" style={{ fontSize: 12 }}>Remote</span>
          )}
        </div>

        {/* Score bar — segmented */}
        <ScoreSegments segments={segments} height={6} />

        {/* Skill chips */}
        {(matched.length > 0 || missing.length > 0) && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
            {matched.map(s => (
              <Chip key={s} variant="match" icon={<Icon d={Icons.check} size={10} strokeWidth={2.5} />}>
                {s}
              </Chip>
            ))}
            {missing.slice(0, 2).map(s => (
              <Chip key={s} variant="miss">{s}</Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type SortKey = 'score' | 'recency' | 'salary';

export default function DiscoverPage() {
  const { jobs, loading, error, userPrefs, hasResume } = useJobs();
  const { session, isInitialized } = useAuthStore();
  const [sort, setSort] = useState<SortKey>('score');
  const [filterRemote, setFilterRemote] = useState(false);

  const profileLoaded = isInitialized && session && hasResume !== null && !loading;
  const needsResume = profileLoaded && !hasResume;
  const needsPrefs = profileLoaded && hasResume && !userPrefs?.targetRole;
  const isOnboarding = needsResume || needsPrefs;

  const sortedJobs = useMemo(() => {
    let list = filterRemote ? jobs.filter(j => j.remote) : jobs;
    if (sort === 'score') list = [...list].sort((a, b) => b.score - a.score);
    else if (sort === 'recency') {
      list = [...list].sort((a, b) => {
        const ta = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const tb = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return tb - ta;
      });
    } else if (sort === 'salary') {
      list = [...list].sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
    }
    return list;
  }, [jobs, sort, filterRemote]);

  const userSkills = userPrefs?.skills ?? [];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="discover" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Discover
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              Today&apos;s feed
              {jobs.length > 0 && (
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 400, marginLeft: 8 }}>
                  {jobs.length} listings
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Remote filter */}
            <button
              onClick={() => setFilterRemote(!filterRemote)}
              className={filterRemote ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '6px 12px', fontSize: 12, gap: 6 }}
            >
              <Icon d={Icons.loc} size={13} />
              Remote only
            </button>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 8, padding: 3 }}>
              {(['score', 'recency', 'salary'] as SortKey[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, fontSize: 12, border: 'none',
                    background: sort === s ? 'var(--bg-elev)' : 'transparent',
                    color: sort === s ? 'var(--ink)' : 'var(--ink-mute)',
                    cursor: 'pointer', fontWeight: sort === s ? 500 : 400,
                    boxShadow: sort === s ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: isOnboarding ? 0 : '24px 28px' }}>

          {/* ── Onboarding wall ── */}
          {isOnboarding && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px' }}>
              <div style={{ maxWidth: 520, width: '100%' }}>
                {/* Header */}
                <div style={{ marginBottom: 36, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 8 }}>
                    Two quick steps before your feed
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
                    Callback needs your resume and preferences to score every listing against your exact profile.
                  </div>
                </div>

                {/* Step 1 — Resume */}
                <div className="card" style={{
                  padding: '24px 28px',
                  marginBottom: 12,
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center',
                  opacity: 1,
                  borderColor: !hasResume ? 'color-mix(in oklch, var(--accent) 40%, transparent)' : 'var(--hairline)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hasResume
                      ? 'color-mix(in oklch, var(--positive) 15%, transparent)'
                      : 'color-mix(in oklch, var(--accent) 15%, transparent)',
                  }}>
                    <Icon d={hasResume ? Icons.check : Icons.upload} size={20}
                      style={{ color: hasResume ? 'var(--positive)' : 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>
                      {hasResume ? 'Resume uploaded ✓' : 'Upload your resume'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                      {hasResume
                        ? 'Skills extracted and ready for scoring'
                        : 'We extract your skills, experience level, and role signals'}
                    </div>
                  </div>
                  {!hasResume && (
                    <Link href="/resume" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, flexShrink: 0 }}>
                      Upload →
                    </Link>
                  )}
                </div>

                {/* Step 2 — Preferences */}
                <div className="card" style={{
                  padding: '24px 28px',
                  marginBottom: 32,
                  display: 'flex',
                  gap: 20,
                  alignItems: 'center',
                  opacity: hasResume ? 1 : 0.45,
                  borderColor: hasResume && needsPrefs ? 'color-mix(in oklch, var(--accent) 40%, transparent)' : 'var(--hairline)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: !needsPrefs && hasResume
                      ? 'color-mix(in oklch, var(--positive) 15%, transparent)'
                      : 'color-mix(in oklch, var(--accent) 15%, transparent)',
                  }}>
                    <Icon d={!needsPrefs && hasResume ? Icons.check : Icons.filter} size={20}
                      style={{ color: !needsPrefs && hasResume ? 'var(--positive)' : 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>
                      {!needsPrefs && hasResume ? 'Preferences set ✓' : 'Set your preferences'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                      {!needsPrefs && hasResume
                        ? 'Target role and filters ready'
                        : 'Target role, salary floor, remote preference, and more'}
                    </div>
                  </div>
                  {hasResume && needsPrefs && (
                    <Link href="/preferences" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, flexShrink: 0 }}>
                      Set up →
                    </Link>
                  )}
                </div>

                {/* Progress indicator */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 3, borderRadius: 99, background: hasResume ? 'var(--positive)' : 'var(--hairline-strong)' }} />
                  <div style={{ width: 32, height: 3, borderRadius: 99, background: !needsPrefs && hasResume ? 'var(--positive)' : 'var(--hairline-strong)' }} />
                  <div style={{ marginLeft: 8, fontSize: 12, color: 'var(--ink-mute)' }}>
                    {hasResume && !needsPrefs ? '2 of 2 — loading your feed…' : hasResume ? '1 of 2 complete' : '0 of 2 complete'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading spinner ── */}
          {!isOnboarding && loading && jobs.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', gap: 12, color: 'var(--ink-mute)' }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--hairline)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'cb-spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 13 }}>Fetching and scoring listings…</div>
            </div>
          )}

          {/* ── Error ── */}
          {!isOnboarding && error && (
            <div style={{ padding: '16px 20px', borderRadius: 10, background: 'var(--penalty-soft)', color: 'var(--penalty)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* ── Job grid ── */}
          {!isOnboarding && sortedJobs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {sortedJobs.map(job => (
                <JobCard key={job.source_id} job={job} userSkills={userSkills} />
              ))}
              {loading && (
                <div style={{ padding: 20, borderRadius: 10, background: 'var(--surface)', fontSize: 12, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '1.5px solid var(--hairline)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'cb-spin 0.8s linear infinite', flexShrink: 0 }} />
                  Loading more listings…
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
