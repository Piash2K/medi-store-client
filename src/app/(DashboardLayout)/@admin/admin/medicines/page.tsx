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

  return (
    <section className="space-y-6 p-1">
      <div className="space-y-2">
        <Link href="/" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <AdminMedicinesPageContent initialMedicines={medicines} />
      </div>
    </section>
  );
}
