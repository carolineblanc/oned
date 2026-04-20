'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('animate-fade-up');
    void el.offsetHeight;
    el.classList.add('animate-fade-up');
  }, [pathname]);

  return (
    <div ref={ref} className="animate-fade-up">
      {children}
    </div>
  );
}
