"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory, updateCategory } from "@/services/category";

type CategoryRow = {
  id: string;
  apiId?: string;
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState("");
  const editingCategory = categories.find((category) => category.id === editingCategoryId) || null;

  const handleEditClick = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const handleOpenAddModal = () => {
    setNewName("");
    setNewDescription("");
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (isCreating) {
      return;
    }

    setIsAddModalOpen(false);
  };

  const handleCreateCategory = async () => {
    const name = newName.trim();

    if (!name) {
      toast.error("Category name is required", { position: "top-right" });
      return;
    }

    setIsCreating(true);

    const result = await createCategory({
      name,
      description: newDescription.trim() || undefined,
    });

    setIsCreating(false);

    if (!result.success || !result.data) {
      toast.error(result.message || "Failed to create category", { position: "top-right" });
      return;
    }

    const createdCategory = result.data;

    const apiId = createdCategory.id || createdCategory._id || "";

    setCategories((previous) => {
      const nextItem: CategoryRow = {
        id: apiId || createdCategory.name,
        apiId: apiId || undefined,
        name: createdCategory.name,
        description: createdCategory.description,
        medicinesCount: 0,
      };

      return [nextItem, ...previous];
    });

    toast.success(result.message || "Category created successfully", { position: "top-right" });
    setIsAddModalOpen(false);
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

  const handleDeleteCategory = async (category: CategoryRow) => {
    if (!category.apiId) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Invalid category id. Could not send delete request.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      title: "Delete category?",
      text: `This will permanently remove ${category.name}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setDeletingCategoryId(category.id);
    const result = await deleteCategory(category.apiId);
    setDeletingCategoryId("");

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: result.message || "Failed to delete category",
      });
      return;
    }

    setCategories((previous) => previous.filter((item) => item.id !== category.id));
    toast.success(result.message || "Category deleted successfully", { position: "top-right" });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">Manage Categories</h1>
        <Button className="gap-2" type="button" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
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
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={5}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => {
                    const isActive = category.medicinesCount > 0;
                    const isDeleting = deletingCategoryId === category.id;

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
                              disabled={isDeleting}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label={`Delete ${category.name}`}
                              onClick={() => handleDeleteCategory(category)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-2xl font-semibold">Add Category</h2>
                <p className="text-muted-foreground mt-1 text-sm">Create a new category.</p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={newDescription} onChange={(event) => setNewDescription(event.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseAddModal} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateCategory} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add Category"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
