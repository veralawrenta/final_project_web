"use client";

import {
  Building2,
  Edit2,
  Layers,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FaHotel } from "react-icons/fa";
import { FaTents } from "react-icons/fa6";
import { MdVilla } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  properties: number;
  createdDate: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  apartment: <Building2 className="w-5 h-5 text-blue-400" />,
  hotel: <FaHotel className="w-5 h-5 text-green-400" />,
  villa: <MdVilla className="w-5 h-5 text-purple-400" />,
  other: <FaTents className="w-5 h-5 text-rose-400" />,
};

const matchCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("apartment")) return "apartment";
  if (lower.includes("hotel")) return "hotel";
  if (lower.includes("villa")) return "villa";
  return "other";
};

export default function CategoryTab() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/category");
      return data;
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.patch(`/category/delete/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteCategory.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your property categories
          </p>
        </div>
        <Link href="/dashboard/tenant/category/create">
          <Button className="gap-2 bg-slate-600 hover:bg-primary hover:text-primary-foreground">
            <Plus className="w-4 h-4" />
            Create Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase">
                    Category
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase">
                    Properties
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase">
                    Created
                  </th>
                  <th className="text-right py-4 px-4 text-xs font-semibold uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category: Category) => {
                  const iconKey = matchCategoryIcon(category.name);

                  return (
                    <tr
                      key={category.id}
                      className={`border-b hover:bg-accent/50 transition-colors ${
                        deletingId === category.id ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                            {categoryIcons[iconKey]}
                          </div>
                          <span className="text-sm font-semibold">
                            {category.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-sm">
                        <span className="bg-accent text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {category.properties}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(category.createdDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/tenant/category/update/${category.id}`}
                                className="flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit Category
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category.id)}
                              className="text-destructive gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No categories found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first category to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
