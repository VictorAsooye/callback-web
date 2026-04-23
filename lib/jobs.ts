import { matchesSkill, TECH_SKILLS, type Job } from './score';

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY!;
const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_description: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_is_remote: boolean;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: 'YEAR' | 'HOUR' | 'MONTH' | 'WEEK' | null;
  job_posted_at_datetime_utc: string | null;
  job_apply_link: string;
  job_is_repost: boolean | null;
  job_apply_quality_score: number | null;
  job_required_experience_in_months: number | null;
  job_highlights: { Qualifications?: string[]; Responsibilities?: string[]; Benefits?: string[] } | null;
  [key: string]: unknown;
}

interface JSearchResponse {
  data: JSearchJob[];
  status: string;
}

function annualizeSalary(raw: JSearchJob): { min: number | null; max: number | null } {
  const multiplier =
    raw.job_salary_period === 'HOUR'  ? 2080 :
    raw.job_salary_period === 'WEEK'  ? 52   :
    raw.job_salary_period === 'MONTH' ? 12   : 1;

  return {
    min: raw.job_min_salary != null ? Math.round(raw.job_min_salary * multiplier) : null,
    max: raw.job_max_salary != null ? Math.round(raw.job_max_salary * multiplier) : null,
  };
}

function formatSalary(raw: JSearchJob): string | null {
  const { min, max } = annualizeSalary(raw);
  if (min == null && max == null) return null;
  const currency = raw.job_salary_currency ?? 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max)!);
}

function buildLocation(job: JSearchJob): string {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.join(', ');
}

function extractQualificationSkills(raw: JSearchJob): string[] | null {
  const lines = raw.job_highlights?.Qualifications;
  if (!lines?.length) return null;
  const text = lines.join(' ');
  const found = TECH_SKILLS.filter((s) => matchesSkill(text, s));
  return found.length > 0 ? found : null;
}

export function normalizeJob(raw: JSearchJob): Job & { applyLink: string } {
  const { min: salaryMin, max: salaryMax } = annualizeSalary(raw);
  return {
    id: '',
    source_id: raw.job_id,
    title: raw.job_title,
    company: raw.employer_name,
    description: raw.job_description ?? '',
    location: buildLocation(raw),
    state: raw.job_state ?? null,
    salary: formatSalary(raw),
    salaryMin,
    salaryMax,
    remote: raw.job_is_remote ?? false,
    posted_at: raw.job_posted_at_datetime_utc ?? null,
    isRepost: raw.job_is_repost ?? false,
    applyQualityScore: raw.job_apply_quality_score ?? null,
    requiredExperienceMonths: raw.job_required_experience_in_months != null
      ? Number(raw.job_required_experience_in_months)
      : null,
    qualificationSkills: extractQualificationSkills(raw),
    raw: raw as unknown as Record<string, unknown>,
    applyLink: raw.job_apply_link,
  };
}

const RELATED_ROLES: Record<string, string[]> = {
  'software engineer':        ['backend engineer', 'full stack engineer'],
  'software developer':       ['software engineer', 'full stack developer'],
  'frontend engineer':        ['frontend developer', 'react developer'],
  'frontend developer':       ['frontend engineer', 'ui engineer'],
  'backend engineer':         ['software engineer', 'api developer'],
  'backend developer':        ['backend engineer', 'software engineer'],
  'full stack engineer':      ['software engineer', 'full stack developer'],
  'full stack developer':     ['full stack engineer', 'web developer'],
  'web developer':            ['frontend developer', 'full stack developer'],
  'ios developer':            ['mobile developer', 'react native developer'],
  'android developer':        ['mobile developer', 'kotlin developer'],
  'mobile developer':         ['ios developer', 'android developer'],
  'react native developer':   ['mobile developer', 'frontend engineer'],
  'data scientist':           ['machine learning engineer', 'data analyst'],
  'data analyst':             ['business analyst', 'data scientist'],
  'data engineer':            ['analytics engineer', 'backend engineer'],
  'machine learning engineer':['ml engineer', 'data scientist'],
  'ml engineer':              ['machine learning engineer', 'ai engineer'],
  'ai engineer':              ['machine learning engineer', 'software engineer'],
  'analytics engineer':       ['data engineer', 'data analyst'],
  'business analyst':         ['data analyst', 'product analyst'],
  'product analyst':          ['business analyst', 'data analyst'],
  'devops engineer':          ['site reliability engineer', 'cloud engineer'],
  'cloud engineer':           ['devops engineer', 'infrastructure engineer'],
  'site reliability engineer':['devops engineer', 'platform engineer'],
  'platform engineer':        ['devops engineer', 'site reliability engineer'],
  'infrastructure engineer':  ['cloud engineer', 'devops engineer'],
  'cybersecurity analyst':    ['security analyst', 'information security analyst'],
  'security analyst':         ['cybersecurity analyst', 'soc analyst'],
  'security engineer':        ['application security engineer', 'devSecOps engineer'],
  'information security analyst': ['cybersecurity analyst', 'security analyst'],
  'soc analyst':              ['security analyst', 'cybersecurity analyst'],
  'product manager':          ['senior product manager', 'product owner'],
  'product owner':            ['product manager', 'program manager'],
  'program manager':          ['project manager', 'product manager'],
  'project manager':          ['program manager', 'scrum master'],
  'ux designer':              ['product designer', 'ui designer'],
  'ui designer':              ['ux designer', 'product designer'],
  'product designer':         ['ux designer', 'ui ux designer'],
  'qa engineer':              ['quality assurance engineer', 'software test engineer'],
  'quality assurance engineer':['qa engineer', 'sdet'],
  'sdet':                     ['qa engineer', 'automation engineer'],
  'network engineer':         ['network administrator', 'systems engineer'],
  'systems engineer':         ['network engineer', 'infrastructure engineer'],
  'systems administrator':    ['network administrator', 'it administrator'],
};

export function getRelatedQueries(targetRole: string): string[] {
  const key = targetRole.toLowerCase().trim();
  const related = RELATED_ROLES[key] ?? [];
  return [key, ...related.slice(0, 2)];
}

export interface FetchJobsOptions {
  query: string;
  location?: string;
  remoteOnly?: boolean;
  page?: number;
  numPages?: number;
}

export async function fetchSingleQuery(
  query: string,
  location: string | undefined,
  remoteOnly: boolean,
  page: number,
  numPages: number,
): Promise<ReturnType<typeof normalizeJob>[]> {
  const params = new URLSearchParams({
    query: location ? `${query} in ${location}` : query,
    page: String(page),
    num_pages: String(numPages),
    date_posted: 'month',
  });
  if (remoteOnly) params.set('remote_jobs_only', 'true');

  const response = await fetch(`${JSEARCH_BASE}/search?${params}`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  });

  if (!response.ok) return [];
  const data = await response.json() as JSearchResponse;
  if (data.status !== 'OK' || !Array.isArray(data.data)) return [];
  return data.data.map(normalizeJob);
}

export async function fetchJobs(options: FetchJobsOptions): Promise<ReturnType<typeof normalizeJob>[]> {
  const { query, location, remoteOnly = false, page = 1, numPages = 1 } = options;
  const queries = getRelatedQueries(query);

  const results = await Promise.allSettled(
    queries.map((q) => fetchSingleQuery(q, location, remoteOnly, page, numPages)),
  );

  const seen = new Set<string>();
  const merged: ReturnType<typeof normalizeJob>[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const job of result.value) {
      if (!seen.has(job.source_id)) {
        seen.add(job.source_id);
        merged.push(job);
      }
    }
  }

  if (merged.length === 0) {
    throw new Error('No jobs returned from any query. Check your API key or network.');
  }

  return merged;
}
