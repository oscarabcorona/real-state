export function ReportSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-lg shrink-0" />
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-1 bg-gray-200 rounded-full" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-9 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
