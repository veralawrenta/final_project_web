"use client";

import { useRouter } from "next/navigation";
import { useCreateCategory } from "@/hooks/useCategory";
import { z } from "zod";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import CategoryForm from "@/components/dashboard-tenant/category/CategoryForm";

const CreateCategoryPage = () => {
  const router = useRouter();
  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const handleSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    await createCategory(values);
  };

  return (
    <CategoryForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/dashboard/tenant/category")}
      isSubmitting={isPending}
    />
  );
};

export default CreateCategoryPage;
