import { WebSidebar } from '@/components/WebSidebar';

export default function AppliedPage() {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <WebSidebar active="applied" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--hairline)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Applied</div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Applications</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 32 }}>—</div>
          <div>No applications tracked yet</div>
          <a href="/discover" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>Start from your feed →</a>
        </div>
      </main>
    </div>
  );
}
