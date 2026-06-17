"use client";
import CreateTransactionComponent from "@/components/profile-user/transactions/CreateTransaction";
import { useGetPropertyId } from "@/hooks/useProperty";
import { ArrowLeft, Building2 } from "lucide-react";
import { useParams } from "next/navigation";

const CreateTransactionPage = () => {
  const params = useParams();

  const propertyId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id,
  );

  const { data: property, isLoading, isError } = useGetPropertyId(Number(propertyId));


  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto p-4 md:p-6">
        {/* Breadcrumb / Navigation Skeleton */}
        <div className="h-4 w-48 bg-muted rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full bg-muted rounded-2xl border border-border" />

            {/* Title & Badge Row */}
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-muted rounded-xl" />
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-muted rounded-full" />
                <div className="h-5 w-32 bg-muted rounded-full" />
              </div>
            </div>

            <hr className="border-border" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-36 bg-muted/80 rounded" />
              </div>

              {/* Quick Stat Blocks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 bg-muted/40 border border-border rounded-xl p-3" />
                <div className="h-14 bg-muted/40 border border-border rounded-xl p-3" />
              </div>

              <div className="h-11 w-full bg-primary/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (isError || !property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm max-w-md w-full overflow-hidden">
          <div className="p-8 text-center flex flex-col items-center">
            {/* Brand/Context Icon Badge */}
            <div className="relative mb-6 flex items-center justify-center">
              {/* Subtle alert highlight glow */}
              <div className="absolute inset-0 scale-150 bg-destructive/5 rounded-full blur-md" />

              {/* Architectural building icon matching prop management */}
              <div className="relative h-14 w-14 bg-background rounded-xl border border-border flex items-center justify-center shadow-sm text-muted-foreground/70">
                <Building2 className="h-6 w-6" />
                {/* Small error indicator dot */}
                <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
              </div>
            </div>

            {/* Error Copy Typography */}
            <h3 className="font-heading font-bold text-xl tracking-tight text-foreground">
              Property Not Found
            </h3>
            <p className="text-sm text-muted-foreground mt-2 px-2 leading-relaxed">
              The property listing you are trying to access doesn't exist, has
              been unlisted, or you don't have authorization to view it.
            </p>

            {/* Interactive Utility Call to Action */}
            <div className="mt-8 w-full pt-6 border-t border-border flex flex-col gap-2">
              <button
                onClick={() => window.history.back()} // or router.back()
                className="inline-flex items-center justify-center gap-2 text-sm font-medium transition-all bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Inventory
              </button>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center text-sm font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 rounded-xl border border-border"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CreateTransactionComponent property={property} />
    </div>
  );
};

export default CreateTransactionPage;
