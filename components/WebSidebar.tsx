'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from './Wordmark';
import { Icon, Icons } from './Icons';
import { useAuthStore } from '@/store/authStore';

type NavKey = 'discover' | 'saved' | 'applied' | 'resume' | 'preferences';

const NAV_ITEMS: { key: NavKey; label: string; ico: keyof typeof Icons; href: string }[] = [
  { key: 'discover',    label: 'Discover',    ico: 'sparkle', href: '/discover' },
  { key: 'saved',       label: 'Saved',       ico: 'up',      href: '/saved' },
  { key: 'applied',     label: 'Applied',     ico: 'check',   href: '/applied' },
  { key: 'resume',      label: 'Resume',      ico: 'upload',  href: '/resume' },
  { key: 'preferences', label: 'Preferences', ico: 'filter',  href: '/preferences' },
];

interface WebSidebarProps {
  active?: NavKey;
}

export function WebSidebar({ active }: WebSidebarProps) {
  const pathname = usePathname();
  const { session, signOut } = useAuthStore();

  const currentActive = active ?? (NAV_ITEMS.find(n => pathname?.startsWith(n.href))?.key ?? 'discover');
  const user = session?.user;
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'User';
  const displayRole = (user?.user_metadata?.role as string | undefined) ?? 'Job seeker';

  return (
    <aside style={{
      width: 220,
      borderRight: '1px solid var(--hairline)',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      background: 'var(--bg-elev)',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 6px 18px' }}>
        <Wordmark height={20} />
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = currentActive === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            style={{
              padding: '9px 10px',
              borderRadius: 7,
              fontSize: 13,
              color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
              background: isActive ? 'var(--surface)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <Icon d={Icons[item.ico]} size={15} strokeWidth={isActive ? 2 : 1.5} />
            {item.label}
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        onClick={() => signOut()}
        style={{
          padding: '12px 10px',
          background: 'var(--surface)',
          borderRadius: 8,
          fontSize: 11,
          color: 'var(--ink-soft)',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
          {displayName}
        </div>
        <div style={{ color: 'var(--ink-mute)' }}>{displayRole}</div>
      </button>
    </aside>
  );
}
