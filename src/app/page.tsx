import Link from 'next/link';
import NavBar from '@/components/layout/NavBar';
import AmbientVideo from '@/components/layout/AmbientVideo';

export default function HomePage() {
  return (
    <div className="cosmos-home">
      <AmbientVideo />
      <NavBar />
      <main id="main-content" className="hero-stage">
        <div className="hero-copy">
          <h1>Honestly,<br />All I need is me</h1>
          <div className="hero-description">
            <p>A quiet place for your thoughts — to remember the everyday, find your own patterns, and grow at your own pace.</p>
            <Link href="/chat" className="text-link">开始记录 <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </main>
      <p className="hero-footnote">SUWIN&apos;S COSMOS <span aria-hidden="true">/</span> 记录 · 陪伴 · 成长</p>
    </div>
  );
}
