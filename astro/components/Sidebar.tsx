'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Now', href: '/now' },
  { label: 'Houses', href: '/houses' },
  { label: 'Deep Cycles', href: '/deep-cycles' },
  { label: "What's Active", href: '/whats-active' },
  { label: 'Your Tools', href: '/your-tools' },
  { label: 'Year 5', href: '/year-5' },
  { label: 'Projects', href: '/projects' },
  { label: 'Value Flow', href: '/value-flow' },
  { label: 'Watch List', href: '/watch-list' },
  { label: 'Decisions', href: '/decisions' },
  { label: 'Ask', href: '/ask' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-card border-r border-border flex flex-col z-50">
      <div className="px-5 py-6 border-b border-border">
        <h1 className="font-display text-2xl italic text-primary tracking-wide">Astro</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-px overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'block px-3 py-2 text-sm rounded-sm transition-colors duration-150',
                active
                  ? 'text-primary bg-border'
                  : 'text-body hover:text-primary hover:bg-border/40',
              ].join(' ')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border space-y-1.5">
        <p className="text-xs text-muted leading-relaxed">
          ☉ Sag 27° · ☽ Gem 1° · ♀ Sco 15° · AC Taurus
        </p>
        <p className="text-xs text-muted">
          Life Path 6 · Year 5
        </p>
      </div>
    </aside>
  );
}
