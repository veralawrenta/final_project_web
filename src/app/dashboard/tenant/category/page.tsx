import CategoryManagementTab from "@/components/dashboard-tenant/category/CategoryManagementTab";
import { Category } from "@/types/category";
import { useRouter } from "next/navigation";

const CategoryManagementPage = () => {
  const router = useRouter();

  const handleAddCategory = () => {
    router.push("/dashboard/tenant/category/create");
  };

  const handleEditCategory = (category: Category) => {
    router.push(`/dashboard/tenant/category/update/${category.id}`);
  };
  return (
    <div>
      <CategoryManagementTab
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
      />
    </div>
  );
};

export default CategoryManagementPage;
