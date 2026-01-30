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
import { useDeleteCategory, useGetCategories } from "@/hooks/useCategory";
import { Category } from "@/types/category";
import { Edit, Loader2, Plus, Search, Tag, Trash2 } from "lucide-react";
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
  const [input, setInput] = useQueryState("search", { defaultValue: "" });
  const [debounceValue] = useDebounceValue(input, 500);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [isDeletingCategory, setIsDeletingCategory] = useState<Category | null>(
    null,
  );

  const { data: getCategories, isPending: getCategoriesPending } =
    useGetCategories({
      page,
      take: 3,
      search: debounceValue,
    });

  const { data: deleteCategory, isPending: deleteCategoryPending } =
    useDeleteCategory();
  //pagination
  const onChangePage = (page: number) => {
    setPage(page);
  };
  //create handle delete untuk delete category
  const handleDelete = async () => {
    if (!isDeletingCategory) return;
    deleteCategory.mutate(isDeletingCategory.id);
    setIsDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your properties with categories
          </p>
        </div>
        <Button className="gap-2" onClick={onAddCategory}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {!getCategoriesPending && !getCategories?.data.length && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {getCategoriesPending && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!getCategoriesPending && getCategories?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        )}

        {getCategories?.data.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold font-mono">
                    ID: {category.id}
                  </span>
                  <h3 className="font-heading font-semibold">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Edit Category"
                onClick={() => onEditCategory(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Delete Category"
                onClick={() => setIsDeletingCategory(category)}
                disabled={deleteCategoryPending}
              >
                {deleteCategoryPending ? (
                  "Loading"
                ) : (
                  <Trash2 className="h-4 w-4" />
                )};
              </Button>
            </div>
          </div>
        ))};
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setIsDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "
                <strong>{deleteCategory?.name}</strong>"?
              </p>
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
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManagementTab;
