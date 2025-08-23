export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-lg border border-gray-700 p-2 w-36 sm:w-44 md:w-48"
      aria-hidden
    >
      <div className="aspect-[2/3] w-full rounded bg-gray-700"></div>
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-700"></div>
      <div className="mt-1 h-3 w-1/2 rounded bg-gray-700"></div>
    </div>
  );
}