'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Now',          href: '/now' },
  { label: 'Houses',       href: '/houses' },
  { label: 'Deep Cycles',  href: '/deep-cycles' },
  { label: "What's Active", href: '/whats-active' },
  { label: 'Your Tools',   href: '/your-tools' },
  { label: 'Year 5',       href: '/year-5' },
  { label: 'Projects',     href: '/projects' },
  { label: 'Value Flow',   href: '/value-flow' },
  { label: 'Watch List',   href: '/watch-list' },
  { label: 'Decisions',    href: '/decisions' },
  { label: 'Ask',          href: '/ask' },
];

function DesktopSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-card border-r border-border flex-col z-50">
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

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const currentLabel = navItems.find((i) => i.href === pathname)?.label ?? 'Astro';

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-5 z-50">
        <span className="font-display text-xl italic text-primary tracking-wide">
          {currentLabel}
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-1"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="block h-px w-5 bg-body transition-all duration-200"
            style={open ? { transform: 'translateY(5px) rotate(45deg)' } : {}} />
          <span className="block h-px w-5 bg-body transition-all duration-200"
            style={open ? { opacity: 0 } : {}} />
          <span className="block h-px w-5 bg-body transition-all duration-200"
            style={open ? { transform: 'translateY(-5px) rotate(-45deg)' } : {}} />
        </button>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-bg/95 backdrop-blur-sm flex flex-col pt-14"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'block px-4 py-3 text-base rounded-sm transition-colors',
                    active
                      ? 'text-primary bg-card'
                      : 'text-body hover:text-primary hover:bg-card/60',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-8 py-6 border-t border-border space-y-1.5">
            <p className="text-xs text-muted leading-relaxed">
              ☉ Sag 27° · ☽ Gem 1° · ♀ Sco 15° · AC Taurus
            </p>
            <p className="text-xs text-muted">Life Path 6 · Year 5</p>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      <DesktopSidebar pathname={pathname} />
      <MobileNav pathname={pathname} />
    </>
  );
}
