export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    </div>
  );
} 