"use client";

import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategory";
import { categoryFormSchema } from "@/lib/validator/dashboard.category.schema";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

interface CategoryFormProps {
  category?: Category | null; //this is for creating props to command if you are starting to edit or you create
  onCancel: () => void;
  isSubmitting : boolean;
  onSubmit : ( data : z.infer<typeof categoryFormSchema>) => void; //this is to validate what action you are doing : create or edit
}

const CategoryForm = ({ category = null, onCancel, onSubmit, isSubmitting = false }: CategoryFormProps) => {
  const isEdit = Boolean(category?.id); // if you are editing this will show edit category and if creating show add new category

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Update category details"
              : "Create a new category to organize your properties"}
          </p>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-6 max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Premium, Budget, Family-friendly"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Loading..."
                  : isEdit
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CategoryForm;
