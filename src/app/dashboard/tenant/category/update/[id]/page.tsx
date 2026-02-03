"use client";

import CategoryForm from "@/components/dashboard-tenant/category/CategoryForm";
import { useGetCategory, useUpdateCategory } from "@/hooks/useCategory";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const { data: category, isLoading } = useGetCategory(categoryId);
  const { mutateAsync: updateCategory, isPending } = useUpdateCategory(categoryId);

  const handleSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    await updateCategory(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4 border rounded-xl p-8 bg-card">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in zoom-in-95">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">Category not found</h2>
        <p className="mb-8 mt-2 max-w-sm text-sm text-muted-foreground">
          We couldn't find the category you're looking for. It may have been deleted or the category ID is incorrect.
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/tenant/category")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/tenant/category")}
        isSubmitting={isPending}
      />
    </div>
  );
}