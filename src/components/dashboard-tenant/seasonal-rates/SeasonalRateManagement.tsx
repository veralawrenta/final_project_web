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
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSeasonalRates, useGetSeasonalRatesbyTenant } from "@/hooks/useSeasonalRates";
import { formatLocalDate, fromDateString } from "@/lib/date/date";
import { formatCurrency } from "@/lib/price/currency";
import { SeasonalRates } from "@/types/seasonal-rates";
import {
  CalendarIcon,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  TrendingUp
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

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
  const [debounceSearch] = useDebounceValue(search, 500);

  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [deleteRate, setDeleteRate] = useState<SeasonalRates | null>(null);

  const { data: seasonalRates, isPending } = useGetSeasonalRatesbyTenant({
    page,
    take: 6,
    search: debounceSearch || undefined,
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

  // Get unique property names for the filter dropdown
  const allRates: SeasonalRates[] = seasonalRates?.data ?? [];
  const propertyOptions = Array.from(
    new Set(allRates.map((rate) => rate.property?.name).filter(Boolean))
  ) as string[];

  const filteredRates = allRates.filter((rate) => {
    if (selectedProperty === "all") return true;
    return rate.property?.name === selectedProperty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Seasonal Rates
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor seasonal pricing rules across your property portfolio.
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={onAddRate}>
          <Plus className="h-4 w-4" />
          Add Seasonal Rate
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by rate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 focus-visible:ring-primary"
          />
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-full sm:w-[240px] bg-background">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by property" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {propertyOptions.map((propertyName) => (
              <SelectItem key={propertyName} value={propertyName}>
                {propertyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {/* Loading State: Skeleton Cards */}
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 border-t flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!isPending && filteredRates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No seasonal rates found</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2">
              {search || selectedProperty !== "all" 
                ? "Try adjusting your filters or search terms to find what you're looking for." 
                : "You haven't added any seasonal rates yet. Start by creating your first price adjustment."}
            </p>
            {search || selectedProperty !== "all" ? (
              <Button 
                variant="outline" 
                className="mt-6" 
                onClick={() => {setSearch(""); setSelectedProperty("all");}}
              >
                Clear all filters
              </Button>
            ) : (
              <Button className="mt-6" onClick={onAddRate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Rate
              </Button>
            )}
          </div>
        )}
        {!isPending && filteredRates.map((rate) => (
          <div
            key={rate.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-end mb-4">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onEditRate(rate)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteRate(rate)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <h3 className="font-heading font-bold text-xl leading-tight mb-1 line-clamp-1">
              {rate.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {rate.property?.name}
            </p>

            <div className="flex items-center gap-3 py-3 border-t border-border mt-auto">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span> {formatLocalDate(fromDateString(rate.startDate.split("T")[0]))} to {formatLocalDate(fromDateString(rate.endDate.split("T")[0]))}</span>
              </div>
              <div className="ml-auto flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-foreground">
                 {formatCurrency(rate.fixedPrice)}
                </span>
                <span className="text-[12px] text-muted-foreground font-medium">/night</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!!seasonalRates?.meta && !isPending && filteredRates.length > 0 && (
        <div className="pt-4">
          <PaginationSection
            meta={seasonalRates.meta}
            onChangePage={onChangePage}
          />
        </div>
      )}

      {/* AlertDialog Logic */}
      <AlertDialog open={!!deleteRate} onOpenChange={() => setDeleteRate(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Seasonal Rate</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p>
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteRate?.name}"</span>? 
                Pricing will revert to the standard base rate for this period.
              </p>
              <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
                <p className="text-destructive text-xs font-bold uppercase tracking-wider mb-2">
                  Permanent Action
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">• Pricing rules will be removed</li>
                  <li className="flex items-center gap-2">• This cannot be undone</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeasonalRateManagementTab;