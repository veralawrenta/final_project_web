"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetCategory, useUpdateCategory } from "@/hooks/useCategory";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import CategoryForm from "@/components/dashboard-tenant/category/CategoryForm";

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
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return (
    <CategoryForm
      category={category}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/tenant/category")}
      isSubmitting={isPending}
    />
  );
}
