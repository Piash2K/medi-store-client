import { Mail, MapPin, PackageCheck, Phone, ShoppingBag, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/services/auth";

const formatRole = (role?: string) => {
  if (!role) {
    return "Unknown";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const formatDate = (value?: string) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const splitAddress = (address?: string | null) => {
  if (!address) {
    return { city: "N/A", fullAddress: "N/A" };
  }

  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] || "N/A",
    fullAddress: address,
  };
};

type ProfilePageContentProps = {
  profile: UserProfile;
  totalOrders: number;
  deliveredOrders: number;
};

export default function ProfilePageContent({
  profile,
  totalOrders,
  deliveredOrders,
}: ProfilePageContentProps) {
  const role = formatRole(profile.role);
  const { city, fullAddress } = splitAddress(profile.address);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border bg-card p-5">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
              <UserCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{profile.name || "User"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{profile.email || "N/A"}</p>
            <Badge className="mt-2">{role}</Badge>
          </div>

          <div className="my-4 border-t" />

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="block">{profile.email || "N/A"}</span>
            </div>
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="block">{profile.phone || "N/A"}</span>
            </div>
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="block">{fullAddress === "N/A" ? city : fullAddress}</span>
            </div>
          </div>

          <div className="my-4 border-t" />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-xl p-4 text-center">
              <ShoppingBag className="text-primary mx-auto h-5 w-5" />
              <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
              <p className="text-muted-foreground text-sm">Orders</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <PackageCheck className="text-primary mx-auto h-5 w-5" />
              <p className="mt-2 text-2xl font-semibold">{deliveredOrders}</p>
              <p className="text-muted-foreground text-sm">Delivered</p>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-2xl font-semibold tracking-tight">Edit Profile</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={profile.name || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={profile.email || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={profile.phone || ""} placeholder="Phone number" readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input defaultValue={city === "N/A" ? "" : city} placeholder="City" readOnly />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input defaultValue={fullAddress === "N/A" ? "" : fullAddress} placeholder="Address" readOnly />
              </div>
            </div>

            <Button className="mt-4 text-sm" type="button">Save Changes</Button>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-2xl font-semibold tracking-tight">Change Password</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  name="current-password-manual"
                  placeholder="Enter your current password"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="Enter your new password" autoComplete="new-password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" placeholder="Confirm your new password" autoComplete="new-password" />
              </div>
            </div>

            <Button variant="outline" className="mt-4 text-sm" type="button">
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
