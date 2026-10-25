export default function PageIntro({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{index} <span aria-hidden="true">/</span> SUWIN&apos;S COSMOS</p>
        <h1>{title}</h1>
      </div>
      <p className="page-description">{description}</p>
    </div>
  );
}
