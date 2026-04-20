export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  );
}

export function CardSkeleton({
  count = 3,
  height = "h-36",
}: {
  count?: number;
  height?: string;
}) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-100 dark:bg-gray-800 rounded-xl`}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800/50 rounded" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-lg">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex items-center gap-5 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-56 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      ))}
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-52 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
