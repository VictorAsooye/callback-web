import Link from 'next/link';

const FOOTER_COLS = [
  ['Product', ['iOS app', 'Web (soon)', 'Changelog', 'Pricing']],
  ['Company', ['About', 'Press kit', 'Contact']],
  ['Legal',   ['Privacy', 'Terms', 'Security']],
] as const;

export function LandingFooter() {
  return (
    <footer style={{ padding: '80px 40px 40px', borderTop: '1px solid var(--hairline)', background: 'var(--ink)', color: 'var(--bg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, maxWidth: 1280, margin: '0 auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="none" stroke="var(--bg)" strokeWidth="1.5" />
              <path d="M6 11a5 5 0 015-5" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="11" cy="11" r="2" fill="var(--bg)" />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Callback</span>
          </div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 360 }}>
            Apply to fewer jobs.<br />Hear back from more.
          </div>
        </div>

        {FOOTER_COLS.map(([heading, items]) => (
          <div key={heading}>
            <div className="mono" style={{ fontSize: 12, color: 'color-mix(in oklch, var(--bg) 50%, transparent)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <a key={item} href="#" style={{ fontSize: 14, color: 'color-mix(in oklch, var(--bg) 80%, transparent)', textDecoration: 'none' }}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60, paddingTop: 20, maxWidth: 1280, margin: '60px auto 0', borderTop: '1px solid color-mix(in oklch, var(--bg) 15%, transparent)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'color-mix(in oklch, var(--bg) 55%, transparent)' }} className="mono">
        <span>© 2026 Callback Labs</span>
        <span>Built with care in Austin, TX</span>
      </div>
    </footer>
  );
}
