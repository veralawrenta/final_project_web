"use client";

import { AlertCircle, ArrowLeft, Check, Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

import { useCategory, useUpdateCategory } from "@/hooks/useCategory";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import z from "zod";

const UpdateCategoryForm = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: category } = useCategory(id);
  const updateCategory = useUpdateCategory(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof categoryFormSchema>>();

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
    }
  }, [category, setValue]);

  const onSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    updateCategory.mutate(data);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/category">
          <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground mt-1">Update the category details</p>
        </div>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Category Information</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Modify the category name and details
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Category Name <span className="text-destructive">*</span>
              </label>

              <Input
                {...register("name", { required: "Category name is required" })}
                placeholder="e.g., Apartment, House, Office, Commercial Space"
                disabled={updateCategory.isPending}
                className={`h-10 text-sm ${
                  errors.name ? "border-destructive focus:border-destructive" : ""
                }`}
                autoFocus
              />

              {errors.name && (
                <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2 text-sm border border-destructive/20">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errors.name.message}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Enter a descriptive name for this property category
              </p>
            </div>

            {updateCategory.isSuccess && (
              <div className="p-4 bg-green-50 text-green-900 rounded-lg flex items-start gap-3 border border-green-200 animate-in fade-in slide-in-from-top-2">
                <Check className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                <div>
                  <p className="font-semibold">Category updated successfully!</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Redirecting to categories list...
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-border">
              <Button type="submit" disabled={updateCategory.isPending} className="gap-2 h-10">
                {updateCategory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {updateCategory.isPending ? "Updating..." : "Update Category"}
              </Button>

              <Link href="/dashboard/category" className="flex-1">
                <Button variant="outline" disabled={updateCategory.isPending} className="w-full h-10 bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateCategoryForm;
