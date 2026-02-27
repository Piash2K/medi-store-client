import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/services/auth";
import { getCategories, getMedicines } from "@/services/medicine";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  medicinesCount: number;
  isActive: boolean;
};

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
        name: category.name,
        slug: toSlug(category.name),
        medicinesCount,
        isActive: medicinesCount > 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="space-y-6 p-1">
      <div className="space-y-2">
        <Link href="/" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Manage Categories</h1>
          <Button className="gap-2" type="button">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Medicines</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categoryRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={5}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categoryRows.map((category) => (
                    <tr key={category.id} className="border-b last:border-0">
                      <td className="px-4 py-4 text-base font-medium">{category.name}</td>
                      <td className="px-4 py-4 text-base text-muted-foreground">{category.slug}</td>
                      <td className="px-4 py-4 text-base">{category.medicinesCount}</td>
                      <td className="px-4 py-4 text-base">
                        {category.isActive ? (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" type="button" aria-label={`Edit ${category.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" type="button" aria-label={`Delete ${category.name}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
