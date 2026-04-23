const STEPS = [
  { n: '01', t: 'Upload your resume', d: 'One PDF. We pull out your skills, aliases and all — \'K8s\' counts as \'Kubernetes\'.' },
  { n: '02', t: 'Set what matters', d: 'Target role, cities, salary floor, clearance level, remote preference.' },
  { n: '03', t: 'Scored feed arrives', d: 'Every listing ranked before you see it. Highest probability first, always.' },
  { n: '04', t: 'Tailor → apply', d: 'One click and Claude rewrites your resume for that specific job. Review. Apply.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 40px 60px', borderTop: '1px solid var(--hairline)', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            [ how it works ]
          </div>
          <h2 className="serif" style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Four steps. Then forever.
          </h2>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', maxWidth: 340 }}>
          Setup takes under three minutes. After that, open the app and the day&apos;s callbacks are already ranked.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{ padding: '24px 0', borderTop: '1px solid var(--ink)' }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 32 }}>{s.n}</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 8, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{s.t}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
