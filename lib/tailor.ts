const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

export interface TailoredResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  education: {
    school: string;
    degree: string;
    graduationDate: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  leadership?: {
    title: string;
    date: string;
    bullets: string[];
  }[];
  projects?: {
    title: string;
    date: string;
    bullets: string[];
  }[];
}

export type TailoringResult = TailoredResume;

export async function tailorResumeForJob(
  resumeText: string,
  jobTitle: string,
  company: string,
  jobDescription: string,
): Promise<TailoredResume> {
  const prompt = `You are an expert resume coach. Your job is to tailor a resume to a specific job posting.

RULES — READ CAREFULLY:
1. Never fabricate experience, skills, certifications, tools, or results the candidate hasn't demonstrated in their resume. Tailoring means reordering, reframing, and language-matching — not invention.
2. If a required skill from the job description doesn't appear anywhere in the candidate's profile, do not add it.
3. Return ONLY valid JSON — no markdown fences, no commentary, no text outside the JSON object.

TAILORING INSTRUCTIONS:
1. Identify the top 8–10 skills and responsibilities the job is looking for.
2. Reorder experience bullet points so the most relevant ones come first per role.
3. Rewrite up to 3 bullets per role to mirror the job's specific language and tools — without inventing experience.
4. Front-load matching skills within each skills category.
5. If the candidate has projects relevant to the role, include them; otherwise omit the projects field.
6. If the candidate has leadership experience, include it; otherwise omit the leadership field.
7. Each bullet must follow: [Strong Action Verb] + [Technology/Tool/System] + [What you did] → [Measurable result/impact].
8. Strong action verbs: Built, Designed, Implemented, Engineered, Automated, Deployed, Secured, Administered, Optimized, Led, Developed, Architected, Migrated, Streamlined, Reduced, Increased.
9. Skills categories to use (only include if candidate actually has skills there): Cybersecurity, Operating Systems, Data & Databases, Cloud & Infrastructure, Networking, Programming Languages, Frameworks & Libraries, Tools & Platforms, Certifications.

TARGET JOB:
Role: ${jobTitle}
Company: ${company}
Description:
${jobDescription.slice(0, 3000)}

CANDIDATE RESUME:
${resumeText.slice(0, 4000)}

Return this exact JSON shape (omit leadership/projects keys entirely if not applicable):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "555-555-5555",
  "location": "City, ST",
  "education": [{"school": "University Name","degree": "Bachelor of Science in Computer Science","graduationDate": "May 2022"}],
  "skills": [{"category": "Cloud & Infrastructure","items": ["AWS", "GCP", "Docker", "Kubernetes"]}],
  "experience": [{"title": "Job Title","company": "Company Name","location": "City, ST","startDate": "Jan 2022","endDate": "Present","bullets": ["Engineered automated CI/CD pipelines using GitHub Actions and Docker, reducing deployment time by 40%"]}],
  "leadership": [{"title": "Leadership Role, Organization","date": "2021 – 2022","bullets": ["Led team of 5 to deliver X"]}],
  "projects": [{"title": "Project Name","date": "2023","bullets": ["Built X using Y, achieving Z"]}]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const raw: string = data?.content?.[0]?.text ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Unexpected response format from Claude');

  const parsed = JSON.parse(jsonMatch[0]) as TailoredResume;
  if (!Array.isArray(parsed.education)) parsed.education = [];
  if (!Array.isArray(parsed.skills)) parsed.skills = [];
  if (!Array.isArray(parsed.experience)) parsed.experience = [];

  return parsed;
}

export interface BoostResult {
  resume: TailoredResume;
  addressed: string[];
  couldNotAddress: string[];
}

export async function boostResumeForATS(
  current: TailoredResume,
  missingKeywords: string[],
  jobDescription: string,
): Promise<BoostResult> {
  const prompt = `You are an expert resume coach making a targeted improvement pass on an already-tailored resume.

CRITICAL RULES:
1. NEVER add skills, tools, or experience the candidate doesn't have.
2. ONLY reframe or rephrase existing experience using exact keyword language from the job description.
3. If a missing keyword has NO basis in the candidate's existing experience, list it in "couldNotAddress" — do NOT add it.
4. Return ONLY valid JSON. No markdown, no commentary.

YOUR TASK:
The candidate's resume was scored by an ATS and is missing these keywords:
${missingKeywords.map((k) => `- "${k}"`).join('\n')}

Look at each missing keyword and ask: "Is there any bullet point, skill, or experience in this resume that relates to this concept, even if described differently?" If yes — rewrite that bullet to use the exact keyword phrase. If no — add it to couldNotAddress.

CURRENT TAILORED RESUME (JSON):
${JSON.stringify(current, null, 2).slice(0, 3000)}

JOB DESCRIPTION (for context):
${jobDescription.slice(0, 1500)}

Return this exact JSON shape:
{
  "resume": { /* full updated TailoredResume JSON */ },
  "addressed": ["keyword1", "keyword2"],
  "couldNotAddress": ["keyword3"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const raw: string = data?.content?.[0]?.text ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Unexpected boost response format');

  const parsed = JSON.parse(jsonMatch[0]) as BoostResult;
  if (!parsed.resume || !Array.isArray(parsed.resume.experience)) {
    throw new Error('Invalid boost response shape');
  }
  parsed.addressed        = parsed.addressed        ?? [];
  parsed.couldNotAddress  = parsed.couldNotAddress  ?? missingKeywords;

  return parsed;
}
