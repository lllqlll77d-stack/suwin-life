import Link from 'next/link';
import NavBar from '@/components/layout/NavBar';

export default function HomePage() {
  return (
    <div className="cosmos-home">
      <NavBar />
      <main id="main-content" className="hero-stage">
        <div className="hero-copy">
          <h1>Honestly,<br />All I need is me</h1>
          <div className="hero-description">
            <p>The meaning of life lies in exploring new horizons, not in clinging to what is familiar. No matter what, we should never lose the courage to move forward.</p>
            <Link href="/chat" className="text-link">START <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
