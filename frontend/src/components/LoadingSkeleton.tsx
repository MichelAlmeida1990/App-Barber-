export default function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="flex justify-end space-x-3">
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
} 