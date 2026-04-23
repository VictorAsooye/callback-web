const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

/**
 * Sends a base64-encoded PDF to Claude to extract resume text.
 * This runs server-side only (in API routes or server actions).
 */
export async function extractResumeText(base64Pdf: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: 'Extract all text from this resume. Return only the raw resume text, preserving its structure (sections, bullet points, dates). Do not add commentary, headers, or formatting that is not in the original.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude API error: ${response.status} ${detail}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const content = data?.content?.[0];
  if (content?.type !== 'text') {
    throw new Error('Unexpected response from Claude API');
  }
  return content.text;
}

/**
 * Extracts skill keywords from resume text using Claude.
 */
export async function extractSkillsFromText(resumeText: string): Promise<string[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract all technical skills from this resume. Return ONLY a JSON array of skill strings, no commentary.

Focus on: programming languages, frameworks, cloud platforms, databases, DevOps tools, methodologies.
Use canonical names (e.g. "Kubernetes" not "K8s", "PostgreSQL" not "Postgres", "JavaScript" not "JS").

Resume:
${resumeText.slice(0, 4000)}

Return only: ["skill1", "skill2", ...]`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> };
  const raw: string = data?.content?.[0]?.text ?? '[]';
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]) as string[];
  } catch {
    return [];
  }
}
