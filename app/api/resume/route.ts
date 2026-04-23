import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { extractResumeText, extractSkillsFromText } from '@/lib/resumeParser';

type CookieItem = { name: string; value: string; options: Record<string, unknown> };

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Extract text using Claude
    const resumeText = await extractResumeText(base64);

    // Extract skills from text
    const skills = await extractSkillsFromText(resumeText);

    // Save to Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAll(cookiesToSet: CookieItem[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          },
        },
      }
    );

    // Fetch existing preferences
    const { data: existing } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    const existingPrefs = (existing?.preferences ?? {}) as Record<string, unknown>;

    await supabase.from('users').upsert({
      id: userId,
      resume_text: resumeText,
      resume_name: file.name,
      resume_uploaded_at: new Date().toISOString(),
      preferences: {
        ...existingPrefs,
        skills,
      },
    });

    return NextResponse.json({ success: true, skillCount: skills.length });
  } catch (err) {
    console.error('[API/resume] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Resume processing failed' },
      { status: 500 }
    );
  }
}
