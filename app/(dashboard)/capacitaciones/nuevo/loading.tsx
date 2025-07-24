import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoadingNuevaCapacitacion() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-64" />
          <div className="h-4 bg-muted animate-pulse rounded w-80" />
        </div>
      </div>

      {/* Form skeleton */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded w-48" />
          </div>
          <div className="h-4 bg-muted animate-pulse rounded w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields skeleton */}
          {Array.from({ length: 6 }, () => crypto.randomUUID()).map((id) => (
            <div key={id} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
          
          {/* Buttons skeleton */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 bg-muted animate-pulse rounded flex-1" />
            <div className="h-10 bg-muted animate-pulse rounded w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
