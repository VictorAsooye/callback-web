'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WebSidebar } from '@/components/WebSidebar';
import { ScoreRing } from '@/components/ScoreRing';
import { ScoreSegments, type Segment } from '@/components/ScoreSegments';
import { Placeholder } from '@/components/Placeholder';
import { Chip } from '@/components/Chip';
import { SignalRow } from '@/components/SignalRow';
import { Icon, Icons } from '@/components/Icons';
import { useAuthStore } from '@/store/authStore';
import { getSupabaseClient } from '@/lib/supabase';
import { calculateCallbackScore, type Job, type UserPreferences } from '@/lib/score';
import { loadJobById } from '@/lib/jobsCache';
import type { ScoredJob } from '@/hooks/useJobs';

interface ScoredJobDetail extends Job {
  score: number;
  scoreBreakdown: ReturnType<typeof calculateCallbackScore>;
  applyLink: string;
}

function formatPostedDate(postedAt: string | null): string {
  if (!postedAt) return 'Unknown';
  const daysAgo = (Date.now() - new Date(postedAt).getTime()) / 86_400_000;
  if (isNaN(daysAgo)) return 'Unknown';
  if (daysAgo < 1) return `${Math.round(daysAgo * 24)}h ago`;
  if (daysAgo < 30) return `${Math.round(daysAgo)}d ago`;
  return new Date(postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function jobToSegments(job: ScoredJobDetail): Segment[] {
  const bd = job.scoreBreakdown;
  const segs: Segment[] = [];
  if (bd.keywordMatch > 0) segs.push({ label: 'Resume match', value: bd.keywordMatch, type: 'pos' });
  if (bd.recency > 0) segs.push({ label: 'Recency', value: bd.recency, type: 'pos' });
  if ((bd.salaryMatch ?? 0) > 0) segs.push({ label: 'Salary', value: bd.salaryMatch!, type: 'pos' });
  if (bd.applyQuality > 0) segs.push({ label: 'Easy apply', value: bd.applyQuality, type: 'pos' });
  if (bd.remoteMatch > 0) segs.push({ label: 'Remote', value: bd.remoteMatch, type: 'pos' });
  if (bd.locationBonus > 0) segs.push({ label: 'City match', value: bd.locationBonus, type: 'pos' });
  if (bd.clearanceBonus > 0) segs.push({ label: 'Clearance', value: bd.clearanceBonus, type: 'pos' });
  if (bd.seniorityPenalty > 0) segs.push({ label: 'Seniority gap', value: -bd.seniorityPenalty, type: 'neg' });
  if (bd.locationPenalty > 0) segs.push({ label: 'Distance', value: -bd.locationPenalty, type: 'neg' });
  if (bd.clearancePenalty > 0) segs.push({ label: 'Clearance req.', value: -bd.clearancePenalty, type: 'neg' });
  if (bd.isRepost) segs.push({ label: 'Repost', value: -10, type: 'neg' });
  return segs.length > 0 ? segs : [{ label: '—', value: 1, type: 'neu' }];
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { session } = useAuthStore();
  const [job, setJob] = useState<ScoredJobDetail | null>(null);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      try {
        // 1. Check session cache first (populated when clicking from discover)
        const cached = loadJobById<ScoredJob>(jobId);
        if (cached) {
          // Fetch user prefs to re-score if session available
          const prefs: UserPreferences = { skills: [], wantsRemote: false };
          if (session) {
            const supabase = getSupabaseClient();
            const { data } = await supabase.from('users').select('preferences').eq('id', session.user.id).single();
            Object.assign(prefs, (data?.preferences as UserPreferences) ?? {});
          }
          setUserPrefs(prefs);
          const breakdown = calculateCallbackScore(cached as unknown as Job, prefs);
          setJob({
            ...(cached as unknown as Job),
            score: breakdown.total,
            scoreBreakdown: breakdown,
            applyLink: cached.applyLink ?? '',
          });
          setLoading(false);
          return;
        }

        // 2. Fallback: look up in Supabase DB
        const supabase = getSupabaseClient();
        const [jobResult, profileResult] = await Promise.all([
          supabase.from('jobs').select('*').eq('source_id', jobId).single(),
          session ? supabase.from('users').select('preferences').eq('id', session.user.id).single() : Promise.resolve({ data: null }),
        ]);

        if (!jobResult.data) {
          setLoading(false);
          return;
        }

        const rawJob = jobResult.data as Job & { apply_link?: string };
        const prefs: UserPreferences = (profileResult.data?.preferences as UserPreferences) ?? { skills: [], wantsRemote: false };
        setUserPrefs(prefs);

        const breakdown = calculateCallbackScore(rawJob, prefs);
        setJob({
          ...rawJob,
          score: breakdown.total,
          scoreBreakdown: breakdown,
          applyLink: rawJob.apply_link ?? '',
        });
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId, session]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
        <WebSidebar active="discover" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--hairline)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'cb-spin 0.8s linear infinite' }} />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
        <WebSidebar active="discover" />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--ink-mute)' }}>
          <div style={{ fontSize: 48 }}>—</div>
          <div style={{ fontSize: 16 }}>Job not found</div>
          <Link href="/discover" className="btn btn-ghost">Back to feed</Link>
        </main>
      </div>
    );
  }

  const segments = jobToSegments(job);
  const avatarLabel = job.company.split(' ').map(w => w[0]).slice(0, 2).join('');
  const matchedSkills = (userPrefs?.skills ?? []).filter(s =>
    job.qualificationSkills?.some(qs => qs.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = (job.qualificationSkills ?? []).filter(qs =>
    !(userPrefs?.skills ?? []).some(us => us.toLowerCase() === qs.toLowerCase())
  );

  const totalSkills = matchedSkills.length + missingSkills.length;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="discover" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link href="/discover" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, gap: 6 }}>
            <Icon d={Icons.back} size={13} /> Back
          </Link>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.05em' }}>
            JSearch
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setSaved(!saved)}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: 12, gap: 6, color: saved ? 'var(--positive)' : undefined }}
          >
            <Icon d={Icons.save} size={13} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Two-column body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 420px' }}>
          {/* LEFT — job info */}
          <div style={{ overflow: 'auto', padding: '32px 40px', borderRight: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 22 }}>
              <Placeholder label={avatarLabel} w={60} h={60} />
              <div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 4, letterSpacing: '0.04em' }}>
                  {job.company.toUpperCase()}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10, color: 'var(--ink)' }}>
                  {job.title}
                </h1>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {job.location && (
                    <Chip icon={<Icon d={Icons.loc} size={11} />}>{job.location}</Chip>
                  )}
                  {job.salary && (
                    <Chip icon={<Icon d={Icons.cash} size={11} />}>{job.salary}</Chip>
                  )}
                  {job.posted_at && (
                    <Chip icon={<Icon d={Icons.clock} size={11} />}>{formatPostedDate(job.posted_at)}</Chip>
                  )}
                  {job.remote && (
                    <Chip variant="warn" icon={<Icon d={Icons.loc} size={11} />}>Remote</Chip>
                  )}
                </div>
              </div>
            </div>

            {/* Company card */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Placeholder label={avatarLabel} w={36} h={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{job.company}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>View company profile</div>
              </div>
            </div>

            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              About the role
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 28 }}>
              {job.description.slice(0, 1500)}
              {job.description.length > 1500 && '…'}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 20, borderTop: '1px solid var(--hairline)' }}>
              <button
                onClick={() => setSaved(!saved)}
                className="btn btn-ghost"
                style={{ height: 46, padding: '0 18px', fontSize: 14 }}
              >
                <Icon d={Icons.save} size={14} /> {saved ? 'Saved' : 'Save job'}
              </button>
              {job.applyLink ? (
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, height: 46, justifyContent: 'center', fontSize: 14 }}
                >
                  <Icon d={Icons.sparkle} size={14} /> Tailor resume &amp; apply
                </a>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, height: 46, justifyContent: 'center', fontSize: 14 }}>
                  <Icon d={Icons.sparkle} size={14} /> Tailor resume &amp; apply
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — score panel */}
          <div style={{ overflow: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Score hero */}
            <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <ScoreRing value={job.score} size={80} stroke={6} />
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Callback odds
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.25, color: 'var(--ink)' }}>
                  {job.score >= 70 ? 'Strong fit' : job.score >= 45 ? 'Moderate fit' : 'Low fit'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
                  {job.score >= 70 ? 'Top match for today\'s feed' : job.score >= 45 ? 'Worth a tailored application' : 'Significant skill or level gap'}
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                Score breakdown
              </div>
              <ScoreSegments segments={segments} height={7} showLegend />
            </div>

            {/* Signals */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Why {job.score}
              </div>
              {job.scoreBreakdown.keywordMatch > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.check} size={14} />}
                  label="Resume match"
                  why={`${matchedSkills.length} skills overlap with requirements`}
                  value={job.scoreBreakdown.keywordMatch}
                  max={50}
                />
              )}
              {job.scoreBreakdown.recency > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.clock} size={14} />}
                  label={`Posted ${formatPostedDate(job.posted_at)}`}
                  why="Fresh listings get more callbacks"
                  value={job.scoreBreakdown.recency}
                  max={20}
                />
              )}
              {(job.scoreBreakdown.salaryMatch ?? 0) > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.cash} size={14} />}
                  label="Salary within range"
                  why={`${job.salary} meets your target`}
                  value={job.scoreBreakdown.salaryMatch!}
                  max={15}
                />
              )}
              {job.scoreBreakdown.remoteMatch > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.loc} size={14} />}
                  label="Remote match"
                  why="You prefer remote, this is remote"
                  value={job.scoreBreakdown.remoteMatch}
                  max={15}
                />
              )}
              {job.scoreBreakdown.seniorityPenalty > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.briefcase} size={14} />}
                  label="Seniority gap"
                  why="Role expects more senior experience"
                  value={-job.scoreBreakdown.seniorityPenalty}
                />
              )}
              {job.scoreBreakdown.locationPenalty > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.loc} size={14} />}
                  label="Location distance"
                  why="Role is in a different region"
                  value={-job.scoreBreakdown.locationPenalty}
                />
              )}
              {job.scoreBreakdown.clearancePenalty > 0 && (
                <SignalRow
                  icon={<Icon d={Icons.shield} size={14} />}
                  label={`Clearance required${job.scoreBreakdown.clearanceSponsorable ? ' (sponsorable)' : ''}`}
                  why={job.scoreBreakdown.clearanceSponsorable ? 'Employer will sponsor — softer penalty' : 'Clearance required, no sponsorship offered'}
                  value={-job.scoreBreakdown.clearancePenalty}
                />
              )}
              {job.scoreBreakdown.isRepost && (
                <SignalRow
                  icon={<Icon d={Icons.rotate} size={14} />}
                  label="Repost"
                  why="Same listing previously posted — lower callback rate"
                  value={-10}
                />
              )}
            </div>

            {/* Skills */}
            {(matchedSkills.length > 0 || missingSkills.length > 0) && (
              <div className="card" style={{ padding: '16px 18px' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Skills matched
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {matchedSkills.map(s => (
                    <Chip key={s} variant="match" icon={<Icon d={Icons.check} size={10} strokeWidth={2.4} />}>{s}</Chip>
                  ))}
                  {missingSkills.map(s => (
                    <Chip key={s} variant="miss">{s}</Chip>
                  ))}
                </div>
                {totalSkills > 0 && (
                  <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--positive)', fontWeight: 500 }}>{matchedSkills.length} of {totalSkills}</span>{' '}
                    required skills on your resume.
                    {missingSkills.length > 0 && (
                      <> Missing: <span className="mono" style={{ fontSize: 10 }}>{missingSkills.slice(0, 3).join(', ')}</span>.</>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
