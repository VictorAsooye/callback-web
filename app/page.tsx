import Link from 'next/link';
import { LandingHero } from './landing/LandingHero';
import { HowItWorks } from './landing/HowItWorks';
import { SignalBreakdown } from './landing/SignalBreakdown';
import { SocialProof } from './landing/SocialProof';
import { LandingFooter } from './landing/LandingFooter';
import { Wordmark } from '@/components/Wordmark';

export default function LandingPage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg)' }}>
      <LandingNav />
      <main>
        <LandingHero />
        <HowItWorks />
        <SignalBreakdown />
        <SocialProof />
        <LandingFooter />
      </main>
    </div>
  );
}

function LandingNav() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 40px',
      borderBottom: '1px solid var(--hairline)',
      position: 'sticky',
      top: 0,
      background: 'var(--bg)',
      zIndex: 100,
    }}>
      <Wordmark height={36} />
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
        <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
        <a href="#the-score" style={{ color: 'inherit', textDecoration: 'none' }}>The score</a>
        <a href="#changelog" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</a>
        <Link href="/sign-in" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
          Sign in
        </Link>
        <Link href="/sign-up" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
          Get started free
        </Link>
      </div>
    </nav>
  );
}
