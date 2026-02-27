"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Medicine } from "@/types/medicine";

type AdminMedicinesPageContentProps = {
  initialMedicines: Medicine[];
};

const getMedicineId = (medicine: Medicine) => medicine.id || medicine._id || medicine.slug || "";

export default function AdminMedicinesPageContent({ initialMedicines }: AdminMedicinesPageContentProps) {
  const medicines = initialMedicines;
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const stock = medicine.stock ?? 0;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 0) ||
        (stockFilter === "out-of-stock" && stock <= 0);

      if (!matchesStock) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchValue = [
        medicine.name,
        medicine.manufacturer,
        medicine.category?.name,
        medicine.seller?.name,
        medicine.seller?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchValue.includes(query);
    });
  }, [medicines, searchTerm, stockFilter]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">View Medicines Inventory</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-72 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search medicines, seller, or category"
            className="pl-9"
          />
        </div>

        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value as "all" | "in-stock" | "out-of-stock")}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="all">All stock statuses</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Seller</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Status</th>
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
                        <td className="px-4 py-4 text-base text-muted-foreground">
                          {medicine.seller?.name || medicine.seller?.email || "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{medicine.category?.name || "Uncategorized"}</Badge>
                        </td>
                        <td className="px-4 py-4 text-base">{`BDT ${Number(medicine.price || 0).toFixed(2)}`}</td>
                        <td className="px-4 py-4 text-base">{stock}</td>
                        <td className="px-4 py-4">
                          {isInStock ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
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
    </>
  );
}
