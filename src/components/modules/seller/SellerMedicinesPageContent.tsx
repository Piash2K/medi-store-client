"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Medicine } from "@/types/medicine";

type SellerMedicinesPageContentProps = {
  initialMedicines: Medicine[];
};

const getMedicineId = (medicine: Medicine) => medicine.id || medicine._id || medicine.slug || medicine.name;

export default function SellerMedicinesPageContent({
  initialMedicines,
}: SellerMedicinesPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMedicines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return initialMedicines;
    }

    return initialMedicines.filter((medicine) => {
      const value = [medicine.name, medicine.category?.name, medicine.manufacturer, medicine.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return value.includes(query);
    });
  }, [initialMedicines, searchTerm]);

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
                    const stock = medicine.stock ?? 0;
                    const isInStock = stock > 0;

                    return (
                      <tr key={getMedicineId(medicine)} className="border-b last:border-0">
                        <td className="px-4 py-4 text-base font-medium">{medicine.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{medicine.category?.name || "Uncategorized"}</Badge>
                        </td>
                        <td className="px-4 py-4 text-base">BDT {Number(medicine.price || 0).toFixed(2)}</td>
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
                            <Button variant="ghost" size="icon" type="button" aria-label="Edit medicine">
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
    </section>
  );
}
