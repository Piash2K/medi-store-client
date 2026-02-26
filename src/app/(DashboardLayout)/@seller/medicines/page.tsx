import { redirect } from "next/navigation";

import SellerMedicinesPageContent from "../../../../components/modules/seller/SellerMedicinesPageContent";
import { getUser } from "@/services/auth";
import { getCategories, getMedicines } from "@/services/medicine";

export default async function SellerMedicinesPage() {
  const user = (await getUser()) as Record<string, unknown> | null;

  if (!user) {
    redirect("/login?redirect=/medicines");
  }

  const role = String(user.role || "").toUpperCase();

  if (role !== "SELLER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const sellerId =
    (typeof user.id === "string" && user.id) ||
    (typeof user.userId === "string" && user.userId) ||
    (typeof user.sub === "string" && user.sub) ||
    "";

  const userEmail = typeof user.email === "string" ? user.email : "";

  const medicinesResult = await getMedicines({ page: 1, limit: 1000 });
  const allMedicines = medicinesResult.success ? medicinesResult.data : [];
  const categories = await getCategories();

  const initialCategories = categories
    .map((category) => {
      const optionId =
        (typeof (category as { id?: string }).id === "string" &&
          (category as { id?: string }).id) ||
        (typeof category._id === "string" && category._id) ||
        "";

      return {
        id: optionId,
        name: category.name,
      };
    })
    .filter((category) => Boolean(category.id));

  const initialMedicines = allMedicines.filter((medicine) => {
    if (role === "ADMIN") {
      return true;
    }

    if (!sellerId && !userEmail) {
      return false;
    }

    const medicineSellerId = medicine.sellerId || medicine.seller?.id || "";
    const medicineSellerEmail = medicine.seller?.email || "";

    return medicineSellerId === sellerId || medicineSellerEmail === userEmail;
  });

  return (
    <SellerMedicinesPageContent
      initialMedicines={initialMedicines}
      initialCategories={initialCategories}
    />
  );
}
