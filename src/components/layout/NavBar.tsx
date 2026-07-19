'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  label: string;
  emoji: string;
  href: string;
}

const TABS: Tab[] = [
  { label: 'Chat', emoji: '💬', href: '/chat' },
  { label: 'History', emoji: '📔', href: '/history' },
  { label: 'Summary', emoji: '📋', href: '/summary' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:top-0 md:bottom-auto">
      <div className="flex justify-center px-4 pb-4 pt-2 md:pb-2 md:pt-4">
        <div
          className="flex items-center gap-1 p-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 20px rgba(255,20,147,0.1)',
          }}
        >
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  capsule-tab
                  flex items-center gap-1.5
                  ${isActive ? 'active' : ''}
                `}
              >
                <span className="text-base md:text-sm">{tab.emoji}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
