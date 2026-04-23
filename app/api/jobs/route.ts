import { NextRequest, NextResponse } from 'next/server';
import { fetchJobs } from '@/lib/jobs';
import { calculateCallbackScore } from '@/lib/score';
import type { UserPreferences } from '@/lib/score';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      query: string;
      location?: string;
      remoteOnly?: boolean;
      prefs?: UserPreferences;
    };

    const { query, location, remoteOnly, prefs } = body;

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const rawJobs = await fetchJobs({ query, location, remoteOnly });

    // Score all jobs if prefs provided
    const scored = prefs
      ? rawJobs.map(job => ({
          ...job,
          score: calculateCallbackScore(job, prefs).total,
          breakdown: calculateCallbackScore(job, prefs),
        })).sort((a, b) => b.score - a.score)
      : rawJobs;

    return NextResponse.json({ jobs: scored });
  } catch (err) {
    console.error('[API/jobs] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
