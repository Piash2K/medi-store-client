"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateCategory } from "@/services/category";

type CategoryRow = {
  id: string;
  name: string;
  description?: string;
  medicinesCount: number;
};

type AdminCategoriesPageContentProps = {
  initialCategories: CategoryRow[];
};

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function AdminCategoriesPageContent({ initialCategories }: AdminCategoriesPageContentProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editingCategory = categories.find((category) => category.id === editingCategoryId) || null;

  const handleEditClick = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const handleCancelEdit = () => {
    if (isSaving) {
      return;
    }

    setEditingCategoryId("");
    setEditName("");
    setEditDescription("");
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) {
      return;
    }

    const nextName = editName.trim();

    if (!nextName) {
      toast.error("Category name is required", { position: "top-right" });
      return;
    }

    setIsSaving(true);

    const result = await updateCategory(editingCategory.id, {
      name: nextName,
      description: editDescription.trim() || undefined,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message || "Failed to update category", { position: "top-right" });
      return;
    }

    setCategories((previous) =>
      previous.map((item) => {
        if (item.id !== editingCategory.id) {
          return item;
        }

        return {
          ...item,
          name: result.data?.name || nextName,
          description: result.data?.description || editDescription.trim() || undefined,
        };
      }),
    );

    toast.success(result.message || "Category updated successfully", { position: "top-right" });
    handleCancelEdit();
  };

  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight">Manage Categories</h1>

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
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={5}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => {
                    const isActive = category.medicinesCount > 0;

                    return (
                      <tr key={category.id} className="border-b last:border-0">
                        <td className="px-4 py-4 text-base font-medium">{category.name}</td>
                        <td className="px-4 py-4 text-base text-muted-foreground">{toSlug(category.name)}</td>
                        <td className="px-4 py-4 text-base">{category.medicinesCount}</td>
                        <td className="px-4 py-4 text-base">
                          {isActive ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label={`Edit ${category.name}`}
                              onClick={() => handleEditClick(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-2xl font-semibold">Edit Category</h2>
                <p className="text-muted-foreground mt-1 text-sm">Update category name and description.</p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdateCategory} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Category"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
