import CartPageContent from "@/components/modules/cart/CartPageContent";
import { getUser } from "@/services/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = (await getUser()) as { role?: string } | null;
  const role = user?.role?.toUpperCase();

  if (role === "SELLER" || role === "ADMIN") {
    redirect("/shop");
  }

  return <CartPageContent />;
}
