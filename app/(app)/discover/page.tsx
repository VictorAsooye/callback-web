'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { WebSidebar } from '@/components/WebSidebar';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreSegments, type Segment } from '@/components/ScoreSegments';
import { Placeholder } from '@/components/Placeholder';
import { Chip } from '@/components/Chip';
import { Icon, Icons } from '@/components/Icons';
import { useJobs, type ScoredJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/store/authStore';

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

  return (
    <Link
      href={`/job/${job.source_id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--hairline-strong)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
      >
        {/* Header row */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <Placeholder label={avatarLabel} w={44} h={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 3 }} className="mono">
              {job.company.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              {job.title}
            </div>
          </div>
          <ScoreRing value={job.score} size={52} stroke={4} />
        </div>

        {/* Meta chips — pill bordered, matching mockup */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {job.location && (
            <span className="chip" style={{ fontSize: 11 }}>
              <Icon d={Icons.loc} size={10} />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="chip" style={{ fontSize: 11 }}>
              <Icon d={Icons.cash} size={10} />
              {job.salary}
            </span>
          )}
          <span className="chip" style={{ fontSize: 11 }}>
            <Icon d={Icons.clock} size={10} />
            {posted}
          </span>
          {job.remote && (
            <span className="chip warn" style={{ fontSize: 11 }}>Remote</span>
          )}
        </div>

        {/* Score bar */}
        <div style={{ marginBottom: matched.length > 0 || missing.length > 0 ? 12 : 0 }}>
          <ScoreSegments segments={segments} height={5} />
        </div>

        {/* Skill chips */}
        {(matched.length > 0 || missing.length > 0) && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
            {matched.map(s => (
              <Chip key={s} variant="match" icon={<Icon d={Icons.check} size={10} strokeWidth={2.4} />}>
                {s}
              </Chip>
            ))}
            {missing.slice(0, 2).map(s => (
              <Chip key={s} variant="miss">{s}</Chip>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

type SortKey = 'score' | 'recency' | 'salary';

export default function DiscoverPage() {
  const { jobs, loading, error, userPrefs, hasResume } = useJobs();
  const { session, isInitialized } = useAuthStore();
  const [sort, setSort] = useState<SortKey>('score');
  const [filterRemote, setFilterRemote] = useState(false);

  const profileLoaded = isInitialized && session && hasResume !== null;
  const needsResume = profileLoaded && !hasResume;
  const needsPrefs = profileLoaded && hasResume && !userPrefs?.targetRole;

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
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>

          {/* Not signed in */}
          {!session && isInitialized && (
            <div style={{ padding: '20px 24px', borderRadius: 10, background: 'var(--surface)', color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
              Please <Link href="/sign-in" style={{ color: 'var(--accent)', textDecoration: 'none' }}>sign in</Link> to load your personalised feed.
            </div>
          )}

          {/* Onboarding: no resume yet */}
          {needsResume && (
            <div style={{ padding: '28px 32px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--hairline)', marginBottom: 24, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'color-mix(in oklch, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={Icons.upload} size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.01em' }}>Upload your resume first</div>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6, marginBottom: 16 }}>
                  Callback scores every job against <em>your</em> resume. Without it, we can&apos;t calculate match quality, keyword alignment, or seniority fit.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link href="/resume" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
                    Upload resume →
                  </Link>
                  <Link href="/preferences" className="btn btn-ghost" style={{ padding: '9px 18px', fontSize: 13 }}>
                    Set preferences
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding: resume uploaded but no target role */}
          {needsPrefs && (
            <div style={{ padding: '20px 24px', borderRadius: 10, background: 'color-mix(in oklch, var(--accent) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--accent) 25%, transparent)', marginBottom: 20, fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Icon d={Icons.filter} size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                Set a <strong style={{ color: 'var(--ink)' }}>target role</strong> in preferences so we can find the right listings for you.
              </span>
              <Link href="/preferences" className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }}>
                Set preferences →
              </Link>
            </div>
          )}

          {/* Loading spinner */}
          {loading && jobs.length === 0 && !needsResume && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', gap: 12, color: 'var(--ink-mute)' }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--hairline)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'cb-spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 13 }}>Fetching and scoring listings…</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '16px 20px', borderRadius: 10, background: 'var(--penalty-soft)', color: 'var(--penalty)', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Job grid */}
          {sortedJobs.length > 0 && (
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
