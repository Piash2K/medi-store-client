"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSellerMedicine,
  deleteSellerMedicine,
  updateSellerMedicine,
} from "@/services/seller-medicine";
import { Category, Medicine } from "@/types/medicine";

type SellerMedicinesPageContentProps = {
  initialMedicines: Medicine[];
  initialCategories: { id: string; name: string }[];
};

const getMedicineId = (medicine: Medicine) => medicine.id || medicine._id || medicine.slug || medicine.name;

export default function SellerMedicinesPageContent({
  initialMedicines,
  initialCategories,
}: SellerMedicinesPageContentProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editManufacturer, setEditManufacturer] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMedicineId, setDeletingMedicineId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newManufacturer, setNewManufacturer] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return medicines;
    }

    return medicines.filter((medicine) => {
      const value = [medicine.name, medicine.category?.name, medicine.manufacturer, medicine.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return value.includes(query);
    });
  }, [medicines, searchTerm]);

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setEditName(medicine.name || "");
    setEditPrice(String(medicine.price ?? ""));
    setEditStock(String(medicine.stock ?? 0));
    setEditManufacturer(medicine.manufacturer || "");
    setEditDescription(medicine.description || "");
  };

  const handleOpenAddModal = () => {
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setNewManufacturer("");
    setNewDescription("");
    setNewCategoryId("");
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (isSaving) {
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleCreateMedicine = async () => {
    const parsedPrice = Number(newPrice);
    const parsedStock = Number(newStock);

    if (!newName.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedStock) || parsedStock < 0 || !newCategoryId) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid input",
        text: "Name, category, valid price, and stock are required",
      });
      return;
    }

    setIsSaving(true);

    const result = await createSellerMedicine({
      name: newName.trim(),
      price: parsedPrice,
      stock: parsedStock,
      manufacturer: newManufacturer.trim() || undefined,
      description: newDescription.trim() || undefined,
      categoryId: newCategoryId,
    });

    setIsSaving(false);

    if (!result.success || !result.data) {
      await Swal.fire({
        icon: "error",
        title: "Create failed",
        text: result.message || "Failed to create medicine",
      });
      return;
    }

    const selectedCategory = initialCategories.find((category) => category.id === newCategoryId);

    const createdMedicine = {
      ...result.data,
      categoryId: result.data.categoryId || newCategoryId,
      category:
        result.data.category ||
        (selectedCategory
          ? ({ _id: selectedCategory.id, name: selectedCategory.name } as Category)
          : undefined),
    };

    setMedicines((previous) => [createdMedicine, ...previous]);
    toast.success(result.message || "Medicine added successfully");
    setIsAddModalOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingMedicine(null);
    setEditName("");
    setEditPrice("");
    setEditStock("");
    setEditManufacturer("");
    setEditDescription("");
  };

  const handleSaveEdit = async () => {
    if (!editingMedicine) {
      return;
    }

    const medicineId = getMedicineId(editingMedicine);
    const parsedPrice = Number(editPrice);
    const parsedStock = Number(editStock);

    if (!medicineId) {
      await Swal.fire({
        icon: "error",
        title: "Invalid medicine",
        text: "Invalid medicine id",
      });
      return;
    }

    if (!editName.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedStock) || parsedStock < 0) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid input",
        text: "Name, valid price, and stock are required",
      });
      return;
    }

    setIsSaving(true);

    const result = await updateSellerMedicine(medicineId, {
      name: editName.trim(),
      price: parsedPrice,
      stock: parsedStock,
      manufacturer: editManufacturer.trim() || undefined,
      description: editDescription.trim() || undefined,
      categoryId:
        editingMedicine.categoryId ||
        editingMedicine.category?.id ||
        editingMedicine.category?._id,
    });

    setIsSaving(false);

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Update failed",
        text: result.message || "Failed to update medicine",
      });
      return;
    }

    const updatedMedicine = result.data;

    if (updatedMedicine) {
      setMedicines((previous) =>
        previous.map((item) => {
          if (getMedicineId(item) !== medicineId) {
            return item;
          }

          return {
            ...item,
            ...updatedMedicine,
            category: updatedMedicine.category || item.category,
            seller: updatedMedicine.seller || item.seller,
          };
        }),
      );
    }

    toast.success(result.message || "Medicine updated successfully");
    handleCancelEdit();
  };

  const handleDeleteClick = async (medicine: Medicine) => {
    const medicineId = getMedicineId(medicine);

    if (!medicineId) {
      await Swal.fire({
        icon: "error",
        title: "Invalid medicine",
        text: "Invalid medicine id",
      });
      return;
    }

    const confirmation = await Swal.fire({
      title: "Delete medicine?",
      text: `This will permanently remove ${medicine.name}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setDeletingMedicineId(medicineId);

    const result = await deleteSellerMedicine(medicineId);

    setDeletingMedicineId("");

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: result.message || "Failed to delete medicine",
      });
      return;
    }

    setMedicines((previous) => previous.filter((item) => getMedicineId(item) !== medicineId));
    toast.success(result.message || "Medicine deleted successfully");
  };

  return (
    <section className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Medicines</h1>
        <Button className="gap-2" type="button" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search medicines..."
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-muted-foreground" colSpan={6}>
                      No medicines found.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => {
                    const medicineId = getMedicineId(medicine);
                    const stock = medicine.stock ?? 0;
                    const isInStock = stock > 0;

                    return (
                      <tr key={medicineId} className="border-b last:border-0">
                        <td className="px-4 py-4 text-base font-medium">{medicine.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{medicine.category?.name || "Uncategorized"}</Badge>
                        </td>
                        <td className="px-4 py-4 text-base">{`BDT ${Number(medicine.price || 0).toFixed(2)}`}</td>
                        <td className="px-4 py-4 text-base">{stock}</td>
                        <td className="px-4 py-4">
                          {isInStock ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Edit medicine"
                              onClick={() => handleEditClick(medicine)}
                              disabled={deletingMedicineId === medicineId}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Delete medicine"
                              onClick={() => handleDeleteClick(medicine)}
                              disabled={deletingMedicineId === medicineId}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
            <CardContent className="space-y-4 pt-5 sm:space-y-5 sm:pt-6">
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">Add Medicine</h2>
                <p className="text-muted-foreground mt-1 text-sm">Fill out the fields to add a new medicine.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {initialCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(event) => setNewStock(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input
                    value={newManufacturer}
                    onChange={(event) => setNewManufacturer(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleCloseAddModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleCreateMedicine}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Add Medicine"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
            <CardContent className="space-y-4 pt-5 sm:space-y-5 sm:pt-6">
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">Update Medicine</h2>
                <p className="text-muted-foreground mt-1 text-sm">Edit medicine information and save changes.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editPrice}
                    onChange={(event) => setEditPrice(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    min={0}
                    value={editStock}
                    onChange={(event) => setEditStock(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input
                    value={editManufacturer}
                    onChange={(event) => setEditManufacturer(event.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
