import { Skeleton } from "@/components/ui/skeleton";
import { useTenantActivity } from "@/hooks/useTenantTransactions";

const TenantActivity = () => {
  const { data: tenantActivity, isPending } = useTenantActivity();

  const hasActivity = (tenantActivity?.recentTransactions.length ?? 0) > 0 || (tenantActivity?.recentMaintenances.length ?? 0) > 0 || (tenantActivity?.recentReviews.length ?? 0) > 0;

  if (isPending) {
    return (
      <div className="container max-auto flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-base tracking-tight">
        Recent Activity
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Latest updates across your properties
      </p>

      <div className="mt-4 space-y-4">
        {!hasActivity && (
          <p className="text-sm text-muted-foreground">
            No recent activity to display.
          </p>
        )}
        {tenantActivity?.recentTransactions?.map((tx, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                New Booking — {tx.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.user.firstName} {tx.user.lastName} booked {tx.room.name} at{" "}
                {tx.room.property.name}
              </p>
            </div>
          </div>
        ))}

        {tenantActivity?.recentReviews?.map((review, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                New Review — {review.ratings}/5
              </p>
              <p className="text-xs text-muted-foreground">
                {review.transaction.user.firstName}{" "}
                {review.transaction.user.lastName} reviewed{" "}
                {review.transaction.room.property.name} · awaiting reply
              </p>
            </div>
          </div>
        ))}

        {tenantActivity?.recentMaintenances?.map((m, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Maintenance Scheduled
              </p>
              <p className="text-xs text-muted-foreground">
                {m.room.name} at {m.room.property.name}
                {m.reason ? ` — ${m.reason}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantActivity;
