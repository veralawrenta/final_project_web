"use client";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteCategory, useGetCategories } from "@/hooks/useCategory";
import { Category } from "@/types/category";
import {
  Edit,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

interface CategoryManagementTabProps {
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
}

const CategoryManagementTab = ({
  onAddCategory,
  onEditCategory,
}: CategoryManagementTabProps) => {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);

  const [isDeletingCategory, setIsDeletingCategory] = useState<Category | null>(
    null
  );

  const { data: getCategories, isPending } = useGetCategories({
    page,
    take: 6, // Increased take for a better grid feel
    search: debounceSearch,
  });

  const { mutate: deleteCategoryMutate, isPending: deleteCategoryPending } =
    useDeleteCategory();

  const handleDelete = () => {
    if (isDeletingCategory?.id) {
      deleteCategoryMutate(isDeletingCategory.id);
      setIsDeletingCategory(null);
    }
  };

  const categories = getCategories?.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Classify and organize your property portfolio for better
            searchability.
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl px-6 h-11 shadow-sm transition-all hover:shadow-md"
          onClick={onAddCategory}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border rounded-4xl p-6 space-y-4 bg-card shadow-sm"
            >
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <div className="pt-4 border-t flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!isPending && categories.length === 0 && (
          <div className="col-span-full relative overflow-hidden flex flex-col items-center justify-center py-24 px-8 p-4 border-2 border-dashed border-border/60 rounded-2xl bg-linear-to-b from-muted/20 to-transparent">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 blur-[120px] -z-10" />
            <div className="h-24 w-24 bg-background rounded-[2.5rem] shadow-xl border border-border flex items-center justify-center mb-8 transition-all hover:scale-105 duration-500">
              <Tag className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-center mb-3">
              No categories found
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-10 leading-relaxed text-lg font-medium">
              {search
                ? "We couldn't find any categories matching your search term."
                : "Organize your properties by adding your first category, such as 'Hotels' or 'Apartments'."}
            </p>
            {search ? (
              <Button
                variant="outline"
                className="rounded-2xl px-12 h-14"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            ) : (
              <Button
                className="rounded-2xl px-12 h-14 text-lg font-semibold shadow-sm"
                onClick={onAddCategory}
              >
                <Plus className="h-5 w-5 mr-3" />
                Add First Category
              </Button>
            )}
          </div>
        )}

        {/* Category Cards */}
        {!isPending &&
          categories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-card rounded-[2.5rem] border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-tight uppercase">
                  ID: {category.id}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-xl shadow-sm"
                    onClick={() => onEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl shadow-sm text-destructive hover:bg-destructive/10"
                    onClick={() => setIsDeletingCategory(category)}
                    disabled={deleteCategoryPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 mb-6">
                <h3 className="font-heading font-bold text-2xl line-clamp-1">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LayoutGrid className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    {category.propertiesCount}{" "}
                    {category.propertiesCount === 1
                      ? "Property linked"
                      : "Properties linked"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                <span className="text-[11px] font-bold text-muted-foreground/60 tracking-widest uppercase">
                  System Category
                </span>
              </div>
            </div>
          ))}
      </div>

      <AlertDialog
        open={!!isDeletingCategory}
        onOpenChange={() => setIsDeletingCategory(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="h-14 w-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold">
              Remove Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed pt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">
                "{isDeletingCategory?.name}"
              </span>
              ? Properties linked to this category may lose their
              classification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 gap-3">
            <AlertDialogCancel className="rounded-xl px-6 border-none bg-muted/50 hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl px-8 shadow-lg shadow-destructive/20"
            >
              {deleteCategoryPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Delete Category"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManagementTab;
