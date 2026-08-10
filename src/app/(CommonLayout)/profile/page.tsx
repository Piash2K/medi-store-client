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
      <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
        <div className="home-shell py-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300">My Profile</h1>
          <p className="mt-6 text-sm text-rose-600 dark:text-rose-300">
            {profileResult.message || "Failed to load profile. Please try again."}
          </p>
        </div>
      </main>
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
