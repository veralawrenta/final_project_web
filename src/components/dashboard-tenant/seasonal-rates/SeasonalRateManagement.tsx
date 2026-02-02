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
  CalendarIcon,
  DollarSign,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useGetSeasonalRatesbyTenant, useDeleteSeasonalRates } from "@/hooks/useSeasonalRates";
import { SeasonalRates } from "@/types/room";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { format } from "date-fns";
import { fromDateString } from "@/lib/date";

interface SeasonalRateManagementTabProps {
  onAddRate: () => void;
  onEditRate: (rate: SeasonalRates) => void;
}

const SeasonalRateManagementTab = ({
  onAddRate,
  onEditRate,
}: SeasonalRateManagementTabProps) => {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [deleteRate, setDeleteRate] = useState<SeasonalRates | null>(null);

  const {
    data: seasonalRates,
    isPending: getRatesPending,
  } = useGetSeasonalRatesbyTenant({
    page,
    take: 6,
    search: debouncedSearch || undefined,
  });

  const {
    mutate: deleteSeasonalRate,
    isPending: deleteRatePending,
  } = useDeleteSeasonalRates();

  const allRates: SeasonalRates[] = seasonalRates?.data ?? [];

  const propertyOptions = Array.from(
    new Set(allRates.map((rate) => rate.propertyName).filter(Boolean)),
  ) as string[];

  const filteredRates = allRates.filter((rate) => {
    const matchesSearch =
      !debouncedSearch ||
      rate.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesProperty =
      selectedProperty === "all" ||
      (rate.propertyName && rate.propertyName === selectedProperty);
    return matchesSearch && matchesProperty;
  });

  const handleChangePage = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleDelete = () => {
    if (!deleteRate) return;
    deleteSeasonalRate(deleteRate.id);
    setDeleteRate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Seasonal Rates
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage seasonal pricing for your properties
          </p>
        </div>
        <Button className="gap-2" onClick={onAddRate}>
          <Plus className="h-4 w-4" />
          Add Seasonal Rate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Filter by property" />
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

      {/* Rates List */}
      {getRatesPending && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!getRatesPending && filteredRates.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">No seasonal rates found</p>
        </div>
      )}

      {!getRatesPending && filteredRates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRates.map((rate) => (
            <div
              key={rate.id}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold font-mono">
                    ID: {rate.id}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit Rate"
                    onClick={() => onEditRate(rate)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Delete Rate"
                    onClick={() => setDeleteRate(rate)}
                    disabled={deleteRatePending}
                  >
                    {deleteRatePending ? (
                      "Loading"
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <h3 className="font-heading font-semibold text-lg">{rate.name}</h3>
              <p className="text-sm text-muted-foreground">{rate.propertyName}</p>

              <div className="flex items-center gap-2 mt-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold text-primary">
                  ${rate.fixedPrice}
                </span>
                <span className="text-sm text-muted-foreground">/ night</span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(fromDateString(rate.startDate), "MMM d, yyyy")} -{" "}
                  {format(fromDateString(rate.endDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={!!deleteRate} onOpenChange={() => setDeleteRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seasonal Rate</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "
                <strong>{deleteRate?.name}</strong>"?
              </p>
              <p className="text-destructive font-medium">
                ⚠️ This action will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>This seasonal rate configuration</li>
                <li>Any associated booking price adjustments</li>
              </ul>
              <p className="text-sm font-medium">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Rate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeasonalRateManagementTab;
