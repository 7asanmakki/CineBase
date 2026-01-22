export default function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-2"
      aria-hidden
    >
      <div className="h-60 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="mt-1 h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
    </div>
  );
}