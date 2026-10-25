import Link from 'next/link';

export default function SiteBrand() {
  return (
    <Link className="site-brand" href="/" aria-label="Suwin’s Cosmos 首页">
      <svg className="brand-symbol" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" shapeRendering="crispEdges">
        <path d="M10 1h4v4h-4zM6 5h4v4H6zM14 5h4v4h-4zM2 9h4v6H2zM18 9h4v6h-4zM6 15h4v4H6zM14 15h4v4h-4zM10 19h4v4h-4z" />
      </svg>
      <span>suwin&apos;s cosmos</span>
    </Link>
  );
}
