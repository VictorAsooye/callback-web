'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchSingleQuery, getRelatedQueries, normalizeJob } from '@/lib/jobs';
import { calculateCallbackScore, type Job, type UserPreferences } from '@/lib/score';
import { loadJobCache, saveJobCache } from '@/lib/jobsCache';
import { useAuthStore } from '@/store/authStore';

export type { UserPreferences };

export interface ScoredJob extends Job {
  score: number;
  scoreBreakdown: {
    recency: number;
    keywordMatch: number;
    remoteMatch: number;
    salaryMatch: number | null;
    applyQuality: number;
    isRepost: boolean;
    seniorityPenalty: number;
    experienceGapPenalty: number;
    locationPenalty: number;
    locationBonus: number;
    titleProximityPenalty: number;
    clearanceBonus: number;
    clearancePenalty: number;
    clearanceSponsorable: boolean;
  };
  applyLink: string;
}

function scoreJob(
  raw: ReturnType<typeof normalizeJob>,
  prefs: UserPreferences & { targetRole?: string },
): ScoredJob {
  const breakdown = calculateCallbackScore(raw, prefs);
  return {
    ...raw,
    score: breakdown.total,
    scoreBreakdown: {
      recency:               breakdown.recency,
      keywordMatch:          breakdown.keywordMatch,
      remoteMatch:           breakdown.remoteMatch,
      salaryMatch:           breakdown.salaryMatch,
      applyQuality:          breakdown.applyQuality,
      isRepost:              breakdown.isRepost,
      seniorityPenalty:      breakdown.seniorityPenalty,
      experienceGapPenalty:  breakdown.experienceGapPenalty,
      locationPenalty:       breakdown.locationPenalty,
      locationBonus:         breakdown.locationBonus,
      titleProximityPenalty: breakdown.titleProximityPenalty,
      clearanceBonus:        breakdown.clearanceBonus,
      clearancePenalty:      breakdown.clearancePenalty,
      clearanceSponsorable:  breakdown.clearanceSponsorable,
    },
  };
}

export function useJobs() {
  const { session } = useAuthStore();
  const [jobs, setJobs]           = useState<ScoredJob[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [userPrefs, setUserPrefs] = useState<(UserPreferences & { targetRole?: string }) | null>(null);
  const [hasResume, setHasResume] = useState<boolean | null>(null);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const loadJobs = async () => {
    if (!session || fetchingRef.current) return;
    fetchingRef.current = true;
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const [profileResult, applicationsResult] = await Promise.all([
        supabase.from('users').select('preferences, resume_text').eq('id', session.user.id).single(),
        supabase.from('applications').select('jobs(source_id)').eq('user_id', session.user.id),
      ]);

      const prefs: UserPreferences & { targetRole?: string } =
        (profileResult.data?.preferences as UserPreferences & { targetRole?: string }) ?? { skills: [], wantsRemote: false };
      setUserPrefs(prefs);
      setHasResume(!!profileResult.data?.resume_text);

      const seenSourceIds = new Set<string>(
        (applicationsResult.data ?? []).flatMap((a: { jobs: unknown }) => {
          const j = a.jobs as { source_id: string } | null | Array<{ source_id: string }>;
          if (!j) return [];
          if (Array.isArray(j)) return j.map((x) => x.source_id);
          return [j.source_id];
        }),
      );

      const role = prefs.targetRole ?? 'Software Engineer';

      // Stale-while-revalidate: show cache instantly if available
      const cached = loadJobCache<ScoredJob>(session.user.id, role);
      if (cached && cached.length > 0) {
        const freshFromCache = cached.filter((j) => !seenSourceIds.has(j.source_id));
        if (freshFromCache.length > 0) {
          setJobs(freshFromCache);
          setLoading(false);
        }
      }

      // Progressive fetch: update state as each query resolves
      const queries     = getRelatedQueries(role);
      const merged      = new Set<string>(seenSourceIds);
      const allFresh: ScoredJob[] = [];
      let firstBatchDone = false;

      const queryPromises = queries.map((q) =>
        fetchSingleQuery(q, undefined, prefs.wantsRemote ?? false, 1, 1)
          .then((results) => {
            const batch = results
              .filter((r) => !merged.has(r.source_id))
              .map((r) => {
                merged.add(r.source_id);
                return scoreJob(r, prefs);
              });

            allFresh.push(...batch);

            setJobs((prev) => {
              const base = firstBatchDone ? prev : [];
              return [...base, ...batch].sort((a, b) => b.score - a.score);
            });

            if (!firstBatchDone) {
              firstBatchDone = true;
              setLoading(false);
            }
          })
          .catch(() => {}),
      );

      await Promise.allSettled(queryPromises);

      if (allFresh.length > 0) {
        saveJobCache(session.user.id, role, allFresh);
      }

    } catch (err) {
      console.error('[useJobs] error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  return { jobs, loading, error, reload: loadJobs, userPrefs, hasResume };
}
