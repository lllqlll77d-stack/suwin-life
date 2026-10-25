'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SiteBrand from './SiteBrand';

const TABS = [
  { label: 'Chat', href: '/chat' },
  { label: 'History', href: '/history' },
  { label: 'Summary', href: '/summary' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">跳至主要内容</a>
      <SiteBrand />
      <nav aria-label="主要导航" className="site-nav">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className="nav-link" aria-current={pathname === tab.href ? 'page' : undefined}>
            <span aria-hidden="true">[</span> {tab.label} <span aria-hidden="true">]</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
