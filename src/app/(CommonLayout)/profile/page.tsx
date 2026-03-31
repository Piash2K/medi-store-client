import { redirect } from "next/navigation";

import ProfilePageContent from "@/components/modules/profile/ProfilePageContent";
import { getMyProfile, getUser } from "@/services/auth";
import { getOrders } from "@/services/order";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const profileResult = await getMyProfile();
  const ordersResult = await getOrders();

  const totalOrders = ordersResult.success ? ordersResult.data.length : 0;
  const deliveredOrders = ordersResult.success
    ? ordersResult.data.filter((order) => order.status?.toUpperCase() === "DELIVERED").length
    : 0;

  if (!profileResult.success || !profileResult.data) {
    return (
      <section className="w-full rounded-xl bg-linear-to-b from-emerald-50/25 to-background px-4 py-8 dark:from-emerald-950/10 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <h1 className="text-4xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">My Profile</h1>
        <p className="mt-6 text-sm text-rose-600 dark:text-rose-300">
          {profileResult.message || "Failed to load profile. Please try again."}
        </p>
      </section>
    );
  }

  return (
    <ProfilePageContent
      profile={profileResult.data}
      totalOrders={totalOrders}
      deliveredOrders={deliveredOrders}
    />
  );
}
