import { redirect } from "next/navigation";

import CheckoutPageContent from "@/components/modules/checkout/CheckoutPageContent";
import { getUser } from "@/services/auth";

export default async function CheckoutPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    redirect("/login?redirect=/checkout");
  }

  return <CheckoutPageContent />;
}
