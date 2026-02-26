"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateSellerMedicine } from "@/services/seller-medicine";
import { Medicine } from "@/types/medicine";

type SellerMedicinesPageContentProps = {
  initialMedicines: Medicine[];
};

const getMedicineId = (medicine: Medicine) => medicine.id || medicine._id || medicine.slug || medicine.name;

export default function SellerMedicinesPageContent({
  initialMedicines,
}: SellerMedicinesPageContentProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editManufacturer, setEditManufacturer] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      toast.error("Invalid medicine id", { position: "top-right" });
      return;
    }

    if (!editName.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Name, valid price, and stock are required", { position: "top-right" });
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
      toast.error(result.message || "Failed to update medicine", { position: "top-right" });
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

    toast.success(result.message || "Medicine updated successfully", { position: "top-right" });
    handleCancelEdit();
  };

  return (
    <section className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Medicines</h1>
        <Button className="gap-2" type="button">
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
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" type="button" aria-label="Delete medicine">
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

      {editingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-2xl font-semibold">Update Medicine</h2>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={isSaving}>
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
