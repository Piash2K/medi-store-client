"use client";

import * as React from "react";
import { Mail, MapPin, PackageCheck, Phone, ShoppingBag, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMyProfile, UserProfile } from "@/services/auth";

const formatRole = (role?: string) => {
  if (!role) {
    return "Unknown";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const splitAddress = (address?: string | null) => {
  if (!address) {
    return { city: "", addressDetails: "", fullAddress: "N/A" };
  }

  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  if (parts.length === 1) {
    return {
      city: "",
      addressDetails: parts[0],
      fullAddress: parts[0],
    };
  }

  return {
    city: parts[0] || "",
    addressDetails: parts.slice(1).join(", "),
    fullAddress: parts.join(", "),
  };
};

const normalizeAddressDetails = (rawAddress: string, city: string) => {
  const trimmedAddress = rawAddress.trim();
  const trimmedCity = city.trim();

  if (!trimmedAddress) {
    return "";
  }

  if (!trimmedCity) {
    return trimmedAddress;
  }

  const lowerAddress = trimmedAddress.toLowerCase();
  const lowerCity = trimmedCity.toLowerCase();

  if (lowerAddress === lowerCity) {
    return "";
  }

  if (lowerAddress.startsWith(`${lowerCity},`)) {
    return trimmedAddress.slice(trimmedCity.length + 1).trim();
  }

  return trimmedAddress;
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
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [profileState, setProfileState] = React.useState(profile);

  const parsedProfileAddress = splitAddress(profileState.address);
  const [name, setName] = React.useState(profileState.name || "");
  const [email, setEmail] = React.useState(profileState.email || "");
  const [phone, setPhone] = React.useState(profileState.phone || "");
  const [cityInput, setCityInput] = React.useState(parsedProfileAddress.city);
  const [address, setAddress] = React.useState(parsedProfileAddress.addressDetails);

  const role = formatRole(profileState.role);

  const handleSaveChanges = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = cityInput.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedEmail) {
      await Swal.fire({
        icon: "warning",
        title: "Missing required fields",
        text: "Name and email are required.",
      });
      return;
    }

    const normalizedAddressDetails = normalizeAddressDetails(trimmedAddress, trimmedCity);
    const composedAddress = [trimmedCity, normalizedAddressDetails].filter(Boolean).join(", ");

    setIsSaving(true);

    const result = await updateMyProfile({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || null,
      address: composedAddress || null,
    });

    setIsSaving(false);

    if (!result.success || !result.data) {
      await Swal.fire({
        icon: "error",
        title: "Profile update failed",
        text: result.message || "Failed to update profile",
      });
      return;
    }

    setProfileState(result.data);

    const nextAddressParts = splitAddress(result.data.address);
    setName(result.data.name || "");
    setEmail(result.data.email || "");
    setPhone(result.data.phone || "");
    setCityInput(nextAddressParts.city);
    setAddress(nextAddressParts.addressDetails);

    toast.success(result.message || "Profile updated successfully");
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border bg-card p-5">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
              <UserCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">{profileState.name || "User"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{profileState.email || "N/A"}</p>
            <Badge className="mt-2">{role}</Badge>
          </div>

          <div className="my-4 border-t" />

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="block">{profileState.email || "N/A"}</span>
            </div>
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="block">{profileState.phone || "N/A"}</span>
            </div>
            <div className="text-muted-foreground flex w-full items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="block">{parsedProfileAddress.fullAddress}</span>
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
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={phone}
                  placeholder="Phone number"
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={cityInput}
                  placeholder="City"
                  onChange={(event) => setCityInput(event.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={address}
                  placeholder="Address"
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
            </div>

            <Button className="mt-4 text-sm" type="button" onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
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
