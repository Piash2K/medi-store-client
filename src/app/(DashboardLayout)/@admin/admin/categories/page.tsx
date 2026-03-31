import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AdminCategoriesPageContent from "@/components/modules/admin/AdminCategoriesPageContent";
import { getUser } from "@/services/auth";
import { getCategories, getMedicines } from "@/services/medicine";

type CategoryRow = {
  id: string;
  apiId?: string;
  name: string;
  description?: string;
  medicinesCount: number;
};

const getCategoryKey = (category: { id?: string; _id?: string; name?: string }) => {
  return category.id || category._id || category.name || "";
};

export default async function AdminCategoriesPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    redirect("/login?redirect=/admin/categories");
  }

  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [categories, medicinesResult] = await Promise.all([getCategories(), getMedicines({ page: 1, limit: 1000 })]);

  const medicines = medicinesResult.success ? medicinesResult.data : [];

  const medicineCountByCategoryKey = new Map<string, number>();

  medicines.forEach((medicine) => {
    if (medicine.isDeleted) {
      return;
    }

    const categoryKey =
      medicine.categoryId || medicine.category?.id || medicine.category?._id || medicine.category?.name || "";

    if (!categoryKey) {
      return;
    }

    medicineCountByCategoryKey.set(categoryKey, (medicineCountByCategoryKey.get(categoryKey) || 0) + 1);
  });

  const categoryRows: CategoryRow[] = categories
    .map((category) => {
      const categoryKey = getCategoryKey(category);
      const medicinesCount = medicineCountByCategoryKey.get(categoryKey) || medicineCountByCategoryKey.get(category.name) || 0;

      return {
        id: categoryKey || category.name,
        apiId: category.id || category._id,
        name: category.name,
        description: category.description,
        medicinesCount,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="space-y-6 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="space-y-2">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <AdminCategoriesPageContent initialCategories={categoryRows} />
      </div>
    </section>
  );
}
