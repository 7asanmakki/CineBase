export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden>
      <div className="skeleton poster"></div>
      <div className="skeleton title"></div>
      <div className="skeleton date"></div>
    </div>
  );
}
