/**
 * Canonical tech-skill list used both for keyword scoring and for extracting
 * skills from job_highlights.Qualifications in jobs.ts.
 */
export const TECH_SKILLS = [
  // Cloud
  'AWS', 'Azure', 'GCP',
  // Languages
  'Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Swift',
  'Kotlin', 'C++', 'C#', 'Scala', 'Ruby', 'Bash', 'PowerShell', 'PHP',
  // Web / Frontend
  'React', 'React Native', 'Vue', 'Angular', 'Next.js', 'HTML', 'CSS',
  // Backend / APIs
  'Node.js', 'Express', 'Django', 'FastAPI', 'Rails', 'REST', 'GraphQL',
  // Databases
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle',
  // DevOps / Infra
  'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Ansible', 'Git',
  'Jenkins', 'GitHub', 'GitLab',
  // Data / AI / ML
  'Machine Learning', 'Deep Learning', 'NLP', 'AI', 'ML', 'Data Science',
  'Spark', 'Kafka', 'Tableau', 'Power BI', 'Excel',
  // Other engineering
  'Microservices', '.NET',
  // Enterprise IT
  'Active Directory', 'SharePoint', 'ServiceNow', 'VMware', 'Jira',
  'Salesforce', 'SAP',
  // Process / methodology
  'Agile', 'Scrum', 'ITIL',
];

export const SKILL_ALIASES: Record<string, string[]> = {
  'AWS':              ['Amazon Web Services', 'Amazon AWS'],
  'GCP':              ['Google Cloud Platform', 'Google Cloud'],
  'Azure':            ['Microsoft Azure'],
  'JavaScript':       ['JS', 'ECMAScript', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2019', 'ES2020'],
  'TypeScript':       ['TS'],
  'Python':           ['py'],
  'Go':               ['Golang'],
  'C#':               ['CSharp', 'C Sharp'],
  '.NET':             ['dotnet', 'dot net', 'ASP.NET', 'ASP NET'],
  'React':            ['React.js', 'ReactJS', 'React JS'],
  'React Native':     ['RN'],
  'Vue':              ['Vue.js', 'VueJS', 'Vue JS'],
  'Angular':          ['Angular.js', 'AngularJS', 'Angular JS'],
  'Next.js':          ['Next', 'NextJS', 'Next JS'],
  'Express':          ['Express.js', 'ExpressJS', 'Express JS'],
  'REST':             ['RESTful', 'REST API', 'RESTful API', 'RESTful Services', 'RESTful Web Services'],
  'GraphQL':          ['GQL'],
  'Node.js':          ['Node', 'NodeJS', 'Node JS'],
  'PostgreSQL':       ['Postgres', 'Postgresql'],
  'MongoDB':          ['Mongo'],
  'SQL':              ['T-SQL', 'TSQL', 'PL/SQL', 'PLSQL', 'Structured Query Language', 'MySQL'],
  'Kubernetes':       ['K8s', 'k8s'],
  'CI/CD':            ['Continuous Integration', 'Continuous Deployment', 'Continuous Delivery', 'CI CD', 'CICD'],
  'Git':              ['Version Control', 'Source Control', 'Bitbucket'],
  'Terraform':        ['Infrastructure as Code', 'IaC'],
  'Linux':            ['Unix', 'Ubuntu', 'CentOS', 'RHEL', 'Red Hat', 'Debian', 'Fedora'],
  'Machine Learning': ['ML'],
  'AI':               ['Artificial Intelligence'],
  'Deep Learning':    ['DL', 'Neural Networks', 'Neural Network'],
  'NLP':              ['Natural Language Processing'],
  'Data Science':     ['Data Analytics', 'Data Analysis'],
  'Power BI':         ['PowerBI', 'Microsoft Power BI'],
  'Excel':            ['Microsoft Excel', 'MS Excel', 'Spreadsheets'],
  'Tableau':          ['Tableau Desktop', 'Tableau Server'],
  'Active Directory': ['AD', 'Azure AD', 'Azure Active Directory', 'LDAP', 'ADFS'],
  'SharePoint':       ['Microsoft SharePoint', 'MS SharePoint', 'SharePoint Online'],
  'ServiceNow':       ['SNOW', 'Service Now'],
  'Salesforce':       ['SFDC', 'Salesforce CRM', 'Salesforce.com'],
  'Jira':             ['Atlassian Jira', 'JIRA'],
  'Agile':            ['Agile Methodology', 'Agile Development', 'Agile Framework'],
  'Scrum':            ['Scrum Master', 'Scrum Methodology'],
  'ITIL':             ['ITIL v3', 'ITIL v4', 'IT Infrastructure Library'],
};

export function matchesSkill(text: string, skill: string): boolean {
  if (matchesToken(text, skill)) return true;
  const aliases = SKILL_ALIASES[skill] ?? [];
  return aliases.some((alias) => matchesToken(text, alias));
}

export function skillsEquivalent(a: string, b: string): boolean {
  if (a.toLowerCase() === b.toLowerCase()) return true;
  const aAliases = (SKILL_ALIASES[a] ?? []).map((s) => s.toLowerCase());
  const bAliases = (SKILL_ALIASES[b] ?? []).map((s) => s.toLowerCase());
  return aAliases.includes(b.toLowerCase()) || bAliases.includes(a.toLowerCase());
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  state: string | null;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  remote: boolean;
  posted_at: string | null;
  source_id: string;
  isRepost: boolean;
  applyQualityScore: number | null;
  requiredExperienceMonths: number | null;
  qualificationSkills: string[] | null;
  raw: Record<string, unknown>;
}

export interface UserPreferences {
  skills: string[];
  wantsRemote: boolean;
  minSalary?: number | null;
  yearsExperience?: number | null;
  locationState?: string | null;
  currentTitle?: string | null;
  desiredLocations?: string[];
  clearanceLevel?: ClearanceLevel;
  companySizePreference?: 'startup' | 'mid' | 'enterprise' | 'any';
}

export type ClearanceLevel =
  | 'none'
  | 'public-trust'
  | 'secret'
  | 'top-secret'
  | 'ts-sci';

export interface ScoreBreakdown {
  total: number;
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
}

function scoreRecency(postedAt: string | null): number {
  if (!postedAt) return 0;
  const daysAgo = (Date.now() - new Date(postedAt).getTime()) / 86_400_000;
  if (isNaN(daysAgo)) return 0;
  if (daysAgo < 3)  return 20;
  if (daysAgo < 7)  return 15;
  if (daysAgo < 14) return 10;
  if (daysAgo < 30) return 5;
  return 0;
}

export function matchesToken(text: string, skill: string): boolean {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i').test(text);
}

function scoreKeywords(
  description: string,
  userSkills: string[],
  qualificationSkills: string[] | null,
): number {
  if (!userSkills.length || !description) return 0;

  if (qualificationSkills && qualificationSkills.length > 0) {
    const fromQuals = userSkills.filter((userSkill) =>
      qualificationSkills.some((qualSkill) => skillsEquivalent(userSkill, qualSkill)),
    );
    if (fromQuals.length > 0) {
      return Math.round((fromQuals.length / userSkills.length) * 50);
    }
  }

  const fromDesc = userSkills.filter((s) => matchesSkill(description, s));
  return Math.round((fromDesc.length / userSkills.length) * 50);
}

function scoreRemote(jobIsRemote: boolean, userWantsRemote: boolean): number {
  if (userWantsRemote && jobIsRemote)  return 15;
  if (!userWantsRemote && jobIsRemote) return -10;
  return 0;
}

function scoreSalaryMatch(
  jobSalaryMin: number | null,
  jobSalaryMax: number | null,
  userMinSalary: number | null | undefined,
): number | null {
  if (!userMinSalary || userMinSalary <= 0) return null;
  if (jobSalaryMin == null && jobSalaryMax == null) return null;

  const bestCase = jobSalaryMax ?? jobSalaryMin!;
  const ratio = bestCase / userMinSalary;

  if (ratio >= 1.2)  return 15;
  if (ratio >= 1.0)  return 13;
  if (ratio >= 0.90) return 9;
  if (ratio >= 0.75) return 5;
  return 0;
}

function scoreApplyQuality(applyQualityScore: number | null): number {
  if (applyQualityScore == null) return 7;
  return Math.round(applyQualityScore * 15);
}

export const SENIOR_KEYWORDS = ['senior', 'lead', 'principal', 'staff'];

function scoreSeniorityPenalty(
  jobTitle: string,
  userYearsExperience: number | null | undefined,
): number {
  if (!userYearsExperience || userYearsExperience >= 4) return 0;
  const lower = jobTitle.toLowerCase();
  return SENIOR_KEYWORDS.some((kw) => matchesToken(lower, kw)) ? 30 : 0;
}

function scoreExperienceGapPenalty(
  effectiveRequiredMonths: number | null,
  userYearsExperience: number | null | undefined,
): number {
  if (effectiveRequiredMonths == null) return 0;
  if (!userYearsExperience) return 0;
  const gap = effectiveRequiredMonths - userYearsExperience * 12;
  if (gap <= 24) return 0;
  return Math.min(20, Math.round(((gap - 24) / 36) * 20));
}

const STATE_NAME_TO_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'district of columbia': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI',
  'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME',
  'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX',
  'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
  'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
};

function normaliseState(raw: string): string {
  const upper = raw.trim().toUpperCase();
  if (upper.length === 2) return upper;
  return STATE_NAME_TO_ABBR[raw.trim().toLowerCase()] ?? upper;
}

const STATE_COORDS: Record<string, [number, number]> = {
  AL: [32.36, -86.28],  AK: [58.30, -134.42], AZ: [33.45, -112.07],
  AR: [34.74, -92.33],  CA: [38.56, -121.47],  CO: [39.74, -104.98],
  CT: [41.77, -72.68],  DC: [38.91, -77.04],   DE: [39.16, -75.53],
  FL: [30.45, -84.27],  GA: [33.76, -84.39],   HI: [21.31, -157.83],
  ID: [43.61, -116.24], IL: [39.78, -89.65],   IN: [39.79, -86.15],
  IA: [41.59, -93.62],  KS: [39.04, -95.69],   KY: [38.20, -84.86],
  LA: [30.46, -91.14],  ME: [44.32, -69.77],   MD: [38.97, -76.50],
  MA: [42.24, -71.03],  MI: [42.73, -84.55],   MN: [44.95, -93.09],
  MS: [32.32, -90.21],  MO: [38.57, -92.19],   MT: [46.60, -112.03],
  NE: [40.81, -96.68],  NV: [39.16, -119.75],  NH: [43.22, -71.55],
  NJ: [40.22, -74.76],  NM: [35.67, -105.96],  NY: [42.66, -73.78],
  NC: [35.77, -78.64],  ND: [46.81, -100.78],  OH: [39.96, -83.00],
  OK: [35.48, -97.53],  OR: [44.93, -123.03],  PA: [40.27, -76.88],
  RI: [41.82, -71.42],  SC: [34.00, -81.04],   SD: [44.37, -100.34],
  TN: [36.17, -86.78],  TX: [30.27, -97.75],   UT: [40.75, -111.89],
  VT: [44.27, -72.57],  VA: [37.54, -77.46],   WA: [47.04, -122.89],
  WV: [38.35, -81.63],  WI: [43.07, -89.38],   WY: [41.15, -104.80],
};

function milesApart(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreLocationPenalty(
  jobState: string | null,
  jobIsRemote: boolean,
  userState: string | null | undefined,
): number {
  if (!userState || !jobState || jobIsRemote) return 0;
  const uState = normaliseState(userState);
  const jState = normaliseState(jobState);
  if (uState === jState) return 0;
  const userCoords = STATE_COORDS[uState];
  const jobCoords  = STATE_COORDS[jState];
  if (!userCoords || !jobCoords) return 8;
  const miles = milesApart(userCoords, jobCoords);
  if (miles < 200)  return 2;
  if (miles < 500)  return 4;
  if (miles < 1000) return 7;
  return 10;
}

function scoreLocationBonus(
  jobLocation: string,
  jobIsRemote: boolean,
  desiredLocations: string[] | undefined,
): number {
  if (jobIsRemote || !desiredLocations || desiredLocations.length === 0) return 0;
  const lower = jobLocation.toLowerCase();
  const matched = desiredLocations.some((loc) => lower.includes(loc.toLowerCase().trim()));
  return matched ? 8 : 0;
}

const TITLE_FAMILIES: Record<string, string[]> = {
  engineering:  ['engineer', 'developer', 'programmer', 'architect', 'swe', 'devops', 'platform', 'backend', 'frontend', 'fullstack', 'cloud engineer', 'infrastructure'],
  analyst:      ['analyst', 'business analyst', 'systems analyst', 'data analyst', 'operations analyst', 'it analyst', 'functional analyst'],
  data:         ['data scientist', 'data engineer', 'ml engineer', 'machine learning', 'ai engineer', 'analytics engineer'],
  security:     ['security engineer', 'security analyst', 'penetration tester', 'soc analyst', 'infosec', 'cybersecurity'],
  management:   ['manager', 'director', 'vp', 'head of', 'lead', 'principal', 'chief'],
  product:      ['product manager', 'product owner', 'pm', 'program manager', 'project manager'],
  design:       ['designer', 'ux', 'ui', 'product designer', 'visual designer'],
  support:      ['support', 'helpdesk', 'help desk', 'technician', 'specialist', 'administrator', 'sysadmin'],
};

function resolveFamily(title: string): string | null {
  const lower = title.toLowerCase();
  for (const [family, keywords] of Object.entries(TITLE_FAMILIES)) {
    if (keywords.some((kw) => lower.includes(kw))) return family;
  }
  return null;
}

function scoreTitleProximityPenalty(
  jobTitle: string,
  currentTitle: string | null | undefined,
): number {
  if (!currentTitle) return 0;
  const userFamily = resolveFamily(currentTitle);
  const jobFamily  = resolveFamily(jobTitle);
  if (!userFamily || !jobFamily) return 0;
  if (userFamily === jobFamily) return 0;
  return 15;
}

const CLEARANCE_RANK: Record<ClearanceLevel, number> = {
  'none':         0,
  'public-trust': 1,
  'secret':       2,
  'top-secret':   3,
  'ts-sci':       4,
};

function detectClearanceSponsorship(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /will\s+sponsor\s+(a\s+)?(security\s+)?clearance/.test(t) ||
    /clearance\s+sponsor(ship|able|ed)?/.test(t) ||
    /sponsor(ship)?\s+(is\s+)?(available|provided|offered)/.test(t) ||
    /must\s+be\s+able\s+to\s+obtain\s+(a\s+)?(security\s+)?clearance/.test(t) ||
    /ability\s+to\s+obtain\s+(a\s+)?(security\s+)?clearance/.test(t) ||
    /eligible\s+to\s+obtain\s+(a\s+)?(security\s+)?clearance/.test(t) ||
    /\bcan\s+obtain\s+(a\s+)?(security\s+)?clearance/.test(t) ||
    /clearance\s+can\s+be\s+obtained/.test(t) ||
    /we\s+(will\s+)?sponsor/.test(t)
  );
}

function detectRequiredClearance(text: string): ClearanceLevel {
  const t = text.toLowerCase();
  if (/ts\/sci|ts-sci|sci\s+clearance|sensitive compartmented information/.test(t)) return 'ts-sci';
  if (/top\s*secret/.test(t)) return 'top-secret';
  if (/\bsecret\s+clearance|\bactive\s+secret|\bsecret[-\s]level/.test(t)) return 'secret';
  if (/\bconfidential\s+clearance/.test(t)) return 'secret';
  if (/public\s+trust/.test(t)) return 'public-trust';
  if (/clearance\s+required|must\s+(have|hold|possess)\s+(an?\s+)?((active|current)\s+)?clearance|security\s+clearance\s+(is\s+)?(required|needed|mandatory)/.test(t)) return 'secret';
  return 'none';
}

function scoreClearance(
  description: string,
  title: string,
  userLevel: ClearanceLevel | null | undefined,
): { bonus: number; penalty: number; sponsorable: boolean } {
  if (!userLevel) return { bonus: 0, penalty: 0, sponsorable: false };
  const combined  = `${title} ${description}`;
  const required  = detectRequiredClearance(combined);
  if (required === 'none') return { bonus: 0, penalty: 0, sponsorable: false };
  const userRank  = CLEARANCE_RANK[userLevel];
  const reqRank   = CLEARANCE_RANK[required];
  if (userRank >= reqRank) return { bonus: 12, penalty: 0, sponsorable: false };
  const sponsorable = detectClearanceSponsorship(combined);
  return {
    bonus: 0,
    penalty: sponsorable ? 5 : 20,
    sponsorable,
  };
}

export function calculateCallbackScore(
  job: Job,
  prefs: UserPreferences,
): ScoreBreakdown {
  const recency      = scoreRecency(job.posted_at);
  const keywordMatch = scoreKeywords(job.description ?? '', prefs.skills, job.qualificationSkills);
  const remoteMatch  = scoreRemote(job.remote, prefs.wantsRemote);
  const salaryMatch  = scoreSalaryMatch(job.salaryMin, job.salaryMax, prefs.minSalary);
  const applyQuality = scoreApplyQuality(job.applyQualityScore);

  const isSeniorTitle = SENIOR_KEYWORDS.some((kw) => matchesToken(job.title.toLowerCase(), kw));
  const effectiveRequiredMonths = job.requiredExperienceMonths ?? (isSeniorTitle ? 60 : null);

  const seniorityPenalty     = scoreSeniorityPenalty(job.title, prefs.yearsExperience);
  const experienceGapPenalty = scoreExperienceGapPenalty(effectiveRequiredMonths, prefs.yearsExperience);
  const locationPenalty      = scoreLocationPenalty(job.state, job.remote, prefs.locationState);
  const locationBonus        = scoreLocationBonus(job.location, job.remote, prefs.desiredLocations);
  const titleProximityPenalty = scoreTitleProximityPenalty(job.title, prefs.currentTitle);
  const { bonus: clearanceBonus, penalty: clearancePenalty, sponsorable: clearanceSponsorable } =
    scoreClearance(job.description ?? '', job.title, prefs.clearanceLevel);

  const salaryContrib = salaryMatch ?? 0;
  const rawSignals     = recency + keywordMatch + remoteMatch + salaryContrib + applyQuality + locationBonus + clearanceBonus;
  const repostPenalty  = job.isRepost ? 10 : 0;
  const totalPenalties = repostPenalty + seniorityPenalty + experienceGapPenalty + locationPenalty + titleProximityPenalty + clearancePenalty;
  const penalised      = Math.max(0, Math.min(100, rawSignals - totalPenalties));

  const SENIORITY_CAP = 45;
  const total = seniorityPenalty > 0 ? Math.min(SENIORITY_CAP, penalised) : penalised;

  return {
    total,
    recency,
    keywordMatch,
    remoteMatch,
    salaryMatch,
    applyQuality,
    isRepost: job.isRepost,
    seniorityPenalty,
    experienceGapPenalty,
    locationPenalty,
    locationBonus,
    titleProximityPenalty,
    clearanceBonus,
    clearancePenalty,
    clearanceSponsorable,
  };
}
