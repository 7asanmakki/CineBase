export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
