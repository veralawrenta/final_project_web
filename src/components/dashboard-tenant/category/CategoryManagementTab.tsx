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
import {
  useDeleteCategory,
  useGetCategoriesForTenant,
} from "@/hooks/useCategory";
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
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);

  const [isDeletingCategory, setIsDeletingCategory] =
    useState<Category | null>(null);

  const { data: getCategories, isPending } = useGetCategoriesForTenant({
    page,
    take: 6,
    search: debounceSearch,
  });

  const { mutate: deleteCategoryMutate, isPending: deleteCategoryPending } =
    useDeleteCategory();

  const handleDelete = () => {
    if (isDeletingCategory?.id) {
      deleteCategoryMutate(isDeletingCategory.id);
      setIsDeletingCategory(null);
    };
  };

  const categories = getCategories?.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Classify and organize your property portfolio for better
            searchability.
          </p>
        </div>
        <Button onClick={onAddCategory} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search by category name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Skeleton */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPending && categories.length === 0 && (
        <div className="text-center py-20 border-dashed border rounded-xl">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-bold">No categories found</h3>
          <p className="text-muted-foreground mt-2">
            {search
              ? "No categories match your search."
              : "Start by adding your first category."}
          </p>
          <Button className="mt-6" onClick={onAddCategory}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>
      )}

      {/* Category Cards */}
      {!isPending && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setIsDeletingCategory(category)}
                    disabled={deleteCategoryPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <LayoutGrid className="h-4 w-4" />
                <span>
                  {category.propertiesCount}{" "}
                  {category.propertiesCount === 1
                    ? "Property"
                    : "Properties"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!isDeletingCategory}
        onOpenChange={() => setIsDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{isDeletingCategory?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {deleteCategoryPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
