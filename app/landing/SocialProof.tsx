import { Placeholder } from '@/components/Placeholder';

const QUOTES = [
  { name: 'Priya R.', role: 'Staff Eng · 8 yoe', text: 'I spent three weekends on LinkedIn and got two replies. One week on Callback and I had four recruiter calls. The score actually tracks.' },
  { name: 'Daniel K.', role: 'Backend Eng · 4 yoe', text: 'The tailored resume is the killer feature. Takes my "okay" resume and makes it feel like I wrote it for the role.' },
  { name: 'Alex T.', role: 'PM → Eng · pivoting', text: 'Callback was honest — told me the roles I wanted were a stretch, and why. Made me fix my resume, not the listings.' },
];

export function SocialProof() {
  return (
    <section style={{ padding: '80px 40px 60px', borderTop: '1px solid var(--hairline)', maxWidth: 1280, margin: '0 auto' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
        [ from testflight ]
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {QUOTES.map((q, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: 24, color: 'var(--ink)' }}>
              &ldquo;{q.text}&rdquo;
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Placeholder label={q.name.split(' ').map(w => w[0]).join('')} w={32} h={32} tone={i} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{q.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
