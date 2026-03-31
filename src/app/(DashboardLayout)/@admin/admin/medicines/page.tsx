import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AdminMedicinesPageContent from "@/components/modules/admin/AdminMedicinesPageContent";
import { getUser } from "@/services/auth";
import { getAdminMedicines } from "@/services/admin";
import { getMedicines } from "@/services/medicine";

export default async function AdminMedicinesPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    redirect("/login?redirect=/admin/medicines");
  }

  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [adminMedicinesResult, fallbackMedicinesResult] = await Promise.all([
    getAdminMedicines(),
    getMedicines({ page: 1, limit: 1000 }),
  ]);

  const medicines = adminMedicinesResult.success
    ? adminMedicinesResult.data
    : fallbackMedicinesResult.success
      ? fallbackMedicinesResult.data
      : [];

  const activeMedicines = medicines.filter((medicine) => !medicine.isDeleted);

  return (
    <section className="space-y-6 rounded-xl bg-linear-to-b from-emerald-50/25 to-background p-1 dark:from-emerald-950/10">
      <div className="space-y-2">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <AdminMedicinesPageContent initialMedicines={activeMedicines} />
      </div>
    </section>
  );
}
