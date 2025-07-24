export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-80 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={`metric-card-${i}`} className="border rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-16 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Large Information Card */}
      <div className="border rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`left-section-${i}`} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`right-section-${i}`} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-20 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
