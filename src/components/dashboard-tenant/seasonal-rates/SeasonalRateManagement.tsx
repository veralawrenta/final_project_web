"use client";
import PaginationSection from "@/components/PaginationSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteSeasonalRates,
  useGetSeasonalRatesbyTenant,
} from "@/hooks/useSeasonalRates";
import { formatLocalDate, fromDateString } from "@/lib/date/date";
import { formatCurrency } from "@/lib/price/currency";
import { SeasonalRates } from "@/types/seasonal-rates";
import {
  ArrowRight,
  CalendarIcon,
  Edit,
  Hotel,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface SeasonalRateManagementTabProps {
  onAddRate: () => void;
  onEditRate: (rate: SeasonalRates) => void;
}

const SeasonalRateManagementTab = ({
  onAddRate,
  onEditRate,
}: SeasonalRateManagementTabProps) => {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", {
    defaultValue: "createdAt",
  });
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", {
    defaultValue: "desc",
  });
  const [debounceSearch] = useDebounceValue(search, 500);
  const [deleteRate, setDeleteRate] = useState<SeasonalRates | null>(null);

  const { data: seasonalRates, isPending } = useGetSeasonalRatesbyTenant({
    page,
    take: 6,
    search: debounceSearch || undefined,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const deleteRateMutation = useDeleteSeasonalRates();

  const onChangePage = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleDelete = () => {
    if (deleteRate?.id) {
      deleteRateMutation.mutate(deleteRate.id);
      setDeleteRate(null);
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const allRates: SeasonalRates[] = seasonalRates?.data ?? [];
  const hasActiveFilters =
    search !== "" || sortBy !== "createdAt" || sortOrder !== "desc";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Seasonal Rates
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Optimize your revenue with intelligent seasonal pricing adjustments.
          </p>
        </div>
        <Button
          onClick={onAddRate}
          className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Rate
        </Button>
      </div>
      <div className="bg-muted/30 p-2 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rates, properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-none shadow-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-background border-none shadow-sm h-10">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="fixedPrice">Pricing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[110px] bg-background border-none shadow-sm h-10">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearAll}
              className="rounded-full hover:bg-destructive/10 text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-[400px]">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 w-full rounded-3xl border-2 border-dashed bg-muted/5">
            <div className="relative h-12 w-12 animate-bounce">
              <Image
                src="/images/nuit-logo.png"
                width={48}
                height={48}
                alt="Loading..."
                className="object-contain grayscale opacity-50 h-auto w-auto"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-1 w-24 bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary animate-progress-loading w-full" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Syncing your rates...
              </p>
            </div>
          </div>
        ) : allRates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed rounded-4xl bg-card text-center">
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/2">
              <TrendingUp className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold">No Rates Found</h3>
            <p className="text-muted-foreground max-w-sm mt-2 text-sm">
              {hasActiveFilters
                ? "We couldn't find any matches for your current filters."
                : "Get started by adding your first seasonal pricing rule to boost your property's revenue."}
            </p>
            <Button
              onClick={hasActiveFilters ? handleClearAll : onAddRate}
              variant={hasActiveFilters ? "outline" : "default"}
              className="mt-8 rounded-full"
            >
              {hasActiveFilters ? "Reset Filters" : "Create Your First Rate"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRates.map((rate) => (
              <div
                key={rate.id}
                className="group relative flex flex-col bg-card rounded-3xl border border-border/60 p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary"
                    onClick={() => onEditRate(rate)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-destructive text-destructive/70"
                    onClick={() => setDeleteRate(rate)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mb-4">
                  <Badge
                    variant="outline"
                    className="mb-3 font-medium bg-muted/50 border-none px-3 py-1"
                  >
                    <Hotel className="h-3 w-3 mr-1.5 opacity-60" />
                    {rate.property?.name ??
                      rate.room?.property?.name ??
                      "Global"}
                  </Badge>
                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-1">
                    {rate.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    {rate.room?.name ?? rate.property?.name}
                  </p>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs lg:text-[11px] xl:text-xs">
                      {formatLocalDate(
                        fromDateString(rate.startDate.split("T")[0])
                      )}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                    <span className="text-xs lg:text-[11px] xl:text-xs">
                      {formatLocalDate(
                        fromDateString(rate.endDate.split("T")[0])
                      )}
                    </span>
                  </div>

                  <div className="flex items-end justify-between border-t border-border/50 pt-4">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Nightly Rate
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="sm:text-md lg:text-2xl font-black text-foreground">
                        {formatCurrency(rate.fixedPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!!seasonalRates?.meta && !isPending && allRates.length > 0 && (
        <div className="pt-8 border-t border-border/40">
          <PaginationSection
            meta={seasonalRates.meta}
            onChangePage={onChangePage}
          />
        </div>
      )}

      <AlertDialog open={!!deleteRate} onOpenChange={() => setDeleteRate(null)}>
        <AlertDialogContent className="max-w-[420px] rounded-4xl p-8">
          <AlertDialogHeader>
            <div className="h-12 w-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold">
              Delete this rate?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              The seasonal pricing for{" "}
              <span className="font-bold text-foreground">
                "{deleteRate?.name}"
              </span>{" "}
              will be permanently removed. Pricing for this period will revert
              to your baseline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:space-x-4">
            <AlertDialogCancel className="rounded-full border-none bg-muted hover:bg-muted/80 h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full h-11 px-8"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeasonalRateManagementTab;
