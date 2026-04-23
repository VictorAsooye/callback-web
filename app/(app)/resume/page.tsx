'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WebSidebar } from '@/components/WebSidebar';
import { Icon, Icons } from '@/components/Icons';
import { useAuthStore } from '@/store/authStore';
import { getSupabaseClient } from '@/lib/supabase';

const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_TEXT_CHARS = 8000;

export default function ResumePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(f);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleAnalyse() {
    if (!session) {
      setError('Please sign in first.');
      return;
    }
    if (!file && !pasteText.trim()) {
      setError('Please upload a PDF or paste your resume text.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      if (file) {
        // Upload to Supabase Storage, then call the API route for extraction
        const supabase = getSupabaseClient();
        const path = `${session.user.id}/resume.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Call API route to extract and save
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', session.user.id);

        const res = await fetch('/api/resume', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json() as { error?: string };
          throw new Error(err.error ?? 'Failed to process resume');
        }
      } else {
        // Paste text — save directly
        const supabase = getSupabaseClient();
        await supabase.from('users').upsert({
          id: session.user.id,
          resume_text: pasteText.trim(),
          resume_uploaded_at: new Date().toISOString(),
        });
      }

      router.push('/resume/processing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="resume" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Resume</div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Upload your resume</div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
          <div style={{ maxWidth: 540, width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--penalty-soft)', color: 'var(--penalty)', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '52px 40px',
                borderRadius: 14,
                border: `1.5px dashed ${dragging ? 'var(--accent)' : file ? 'var(--positive)' : 'var(--hairline-strong)'}`,
                background: dragging ? 'color-mix(in oklch, var(--accent) 5%, var(--surface))' : 'var(--surface)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-elev)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: file ? 'var(--positive)' : 'var(--ink)' }}>
                <Icon d={file ? Icons.check : Icons.upload} size={22} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, color: 'var(--ink)' }}>
                {file ? file.name : 'Drop your resume here'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 20 }}>
                {file ? `${(file.size / 1024).toFixed(0)}KB · PDF` : 'PDF · up to 4 MB · never shared'}
              </div>
              {!file && (
                <button
                  className="btn btn-ghost"
                  style={{ margin: '0 auto' }}
                  onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                >
                  Browse files
                </button>
              )}
              {file && (
                <button
                  className="btn btn-ghost"
                  style={{ margin: '0 auto', fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                >
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>or paste text</span>
              <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
            </div>

            {/* Paste area */}
            <div style={{ borderRadius: 10, border: '1px solid var(--hairline-strong)', background: 'var(--bg-elev)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hairline)', fontSize: 12, color: 'var(--ink-mute)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Paste resume text</span>
                <span className="mono" style={{ fontSize: 11 }}>{pasteText.length} / {MAX_TEXT_CHARS} chars</span>
              </div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value.slice(0, MAX_TEXT_CHARS))}
                placeholder="Paste your resume content here — we'll extract skills, seniority signals, and years of experience…"
                style={{ width: '100%', padding: '14px 16px', minHeight: 120, fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6, border: 'none', borderRadius: 0, resize: 'vertical', background: 'transparent', outline: 'none' }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleAnalyse}
              disabled={uploading || (!file && !pasteText.trim())}
              className="btn btn-primary"
              style={{ justifyContent: 'center', height: 48, fontSize: 14, opacity: (uploading || (!file && !pasteText.trim())) ? 0.6 : 1 }}
            >
              <Icon d={Icons.sparkle} size={14} />
              {uploading ? 'Uploading…' : 'Analyse resume'}
            </button>

            <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', textAlign: 'center', lineHeight: 1.5 }}>
              Your resume is stored securely and used only to score job listings and tailor applications. We never share it with employers without your explicit action.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
