import { redirect } from "next/navigation";

import CartPageContent from "@/components/modules/cart/CartPageContent";
import { getUser } from "@/services/auth";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = (await getUser()) as { role?: string } | null;

  if (!user) {
    return <CartPageContent />;
  }

  if (user.role?.toUpperCase() !== "CUSTOMER") {
    redirect("/");
  }

  return <CartPageContent />;
}
