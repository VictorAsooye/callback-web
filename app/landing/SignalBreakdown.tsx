const ROWS = [
  { label: 'Resume match',                    weight: 50,  kind: 'max',     note: 'Skills overlap with the listing, alias-aware' },
  { label: 'Post recency',                    weight: 20,  kind: 'max',     note: 'Fresh listings return responses faster' },
  { label: 'Salary alignment',                weight: 15,  kind: 'max',     note: 'Meets or exceeds your stated floor' },
  { label: 'Easy to apply',                   weight: 15,  kind: 'max',     note: 'Direct apply vs. ATS maze vs. email-only' },
  { label: 'Remote match',                    weight: 15,  kind: 'bonus',   note: 'You want remote, the role is remote' },
  { label: 'Preferred city',                  weight: 8,   kind: 'bonus',   note: 'Listed in your target cities' },
  { label: 'Clearance match',                 weight: 12,  kind: 'bonus',   note: 'You hold the required clearance' },
  { label: 'Repost',                          weight: -10, kind: 'penalty', note: 'Same listing reposted — lower callback rate' },
  { label: 'Location mismatch',               weight: -10, kind: 'penalty', note: 'Graduated by actual Haversine distance' },
  { label: 'Seniority gap',                   weight: -30, kind: 'penalty', note: 'Listing expects a more senior candidate' },
  { label: 'Clearance required, no sponsorship', weight: -20, kind: 'penalty', note: 'Hard blocker — capped' },
];

type Kind = 'max' | 'bonus' | 'penalty';

function kindStyle(kind: Kind) {
  if (kind === 'bonus') return {
    background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
    borderColor: 'transparent',
    color: 'var(--accent)',
  };
  if (kind === 'penalty') return {
    background: 'color-mix(in oklch, var(--penalty) 12%, transparent)',
    borderColor: 'transparent',
    color: 'var(--penalty)',
  };
  return {
    background: 'var(--surface)',
    borderColor: 'transparent',
    color: 'var(--ink-mute)',
  };
}

export function SignalBreakdown() {
  return (
    <section id="the-score" style={{ padding: '60px 40px 60px', borderTop: '1px solid var(--hairline)', background: 'var(--surface)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, maxWidth: 1280, margin: '0 auto' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            [ the score ]
          </div>
          <h2 className="serif" style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 20 }}>
            Eleven signals. One honest number.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: 20 }}>
            No black box. Every job shows exactly how it earned its score — what helped, what hurt, and by how much. You can argue with it. That&apos;s the point.
          </p>
          <button className="btn btn-link">
            Read the scoring doc →
          </button>
        </div>

        <div className="card" style={{ background: 'var(--bg-elev)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="mono">
            <span>signal</span>
            <span>max / weight</span>
          </div>
          <div style={{ padding: '4px 20px 16px' }}>
            {ROWS.map((r, i) => (
              <div
                key={i}
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '11px 0', borderBottom: i < ROWS.length - 1 ? '1px solid var(--hairline)' : 'none' }}
              >
                <div>
                  <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)' }}>
                    {r.label}
                    <span className="chip" style={{ fontSize: 10, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.05em', ...kindStyle(r.kind as Kind) }}>
                      {r.kind}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 3 }}>{r.note}</div>
                </div>
                <div className="mono" style={{ fontSize: 14, color: r.weight < 0 ? 'var(--penalty)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.weight > 0 ? '+' : ''}{r.weight}<span style={{ color: 'var(--ink-mute)' }}> pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
