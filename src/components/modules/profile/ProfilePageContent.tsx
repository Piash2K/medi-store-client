"use client";

import * as React from "react";
import { Camera, Mail, MapPin, PackageCheck, Phone, ShoppingBag, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMyProfile, updateMyProfilePhoto, UserProfile } from "@/services/auth";

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

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const getProfileImage = (profile: UserProfile) => {
  return profile.profileImage || "";
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
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [profileState, setProfileState] = React.useState(profile);
  const [profileImagePreview, setProfileImagePreview] = React.useState(getProfileImage(profile));
  const imageObjectUrlRef = React.useRef<string>("");
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  const parsedProfileAddress = splitAddress(profileState.address);
  const [name, setName] = React.useState(profileState.name || "");
  const [email, setEmail] = React.useState(profileState.email || "");
  const [phone, setPhone] = React.useState(profileState.phone || "");
  const [cityInput, setCityInput] = React.useState(parsedProfileAddress.city);
  const [address, setAddress] = React.useState(parsedProfileAddress.addressDetails);

  const role = formatRole(profileState.role);

  React.useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
      }
    };
  }, []);

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid image",
        text: "Please select a valid image file.",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      await Swal.fire({
        icon: "warning",
        title: "Image too large",
        text: "Image size must be 5MB or less to upload safely.",
      });
      return;
    }

    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    imageObjectUrlRef.current = previewUrl;
    setProfileImagePreview(previewUrl);

    const payload = new FormData();
    payload.append("profileImage", file);

    setIsUploadingImage(true);
    const result = await updateMyProfilePhoto(payload);
    setIsUploadingImage(false);

    if (!result.success || !result.data) {
      setProfileImagePreview(getProfileImage(profileState));
      await Swal.fire({
        icon: "error",
        title: "Image upload failed",
        text: result.message || "Failed to update profile image",
      });
      return;
    }

    setProfileState((previous) => ({
      ...previous,
      ...result.data,
    }));

    setProfileImagePreview(result.data.profileImage || previewUrl);
    toast.success(result.message || "Profile image updated successfully");
    router.refresh();
  };

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
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 md:text-4xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-[#3c4947] dark:text-slate-400">
            Manage your personal details, contact info, and account preferences.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left Column — User Profile Card */}
          <aside className="rounded-xl border border-[#006a63]/20 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 rounded-full border-2 border-[#006a63]/30 shadow-sm dark:border-teal-500/40">
                  {profileImagePreview ? (
                    <AvatarImage src={profileImagePreview} alt={profileState.name || "User"} />
                  ) : null}
                  <AvatarFallback className="bg-[#006a63]/10 text-[#006a63] dark:bg-teal-900/40 dark:text-teal-300">
                    <UserCircle2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#006a63] text-white shadow-md transition-colors hover:bg-[#00504b] dark:bg-teal-600 dark:hover:bg-teal-700"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  aria-label="Upload profile image"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tight text-[#171d1c] font-['Manrope',sans-serif] dark:text-slate-100">
                {profileState.name || "User"}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-[#3c4947] dark:text-slate-400">
                {profileState.email || "N/A"}
              </p>
              <Badge className="mt-2.5 rounded-full bg-[#006a63]/10 px-3 py-0.5 text-xs font-semibold text-[#006a63] hover:bg-[#006a63]/20 dark:bg-teal-900/40 dark:text-teal-300">
                {role}
              </Badge>
              {isUploadingImage ? (
                <p className="mt-2 text-xs font-medium text-[#006a63] dark:text-teal-300">Uploading image...</p>
              ) : null}
            </div>

            <div className="my-6 border-t border-[#006a63]/15 dark:border-slate-800" />

            {/* Quick Contact Info */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-[#3c4947] dark:text-slate-300">
                <Mail className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                <span className="truncate">{profileState.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#3c4947] dark:text-slate-300">
                <Phone className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                <span>{profileState.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#3c4947] dark:text-slate-300">
                <MapPin className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                <span className="truncate">{parsedProfileAddress.fullAddress}</span>
              </div>
            </div>

            <div className="my-6 border-t border-[#006a63]/15 dark:border-slate-800" />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#006a63]/20 bg-[#006a63]/5 p-4 text-center dark:border-teal-800/40 dark:bg-teal-950/40">
                <ShoppingBag className="mx-auto h-5 w-5 text-[#006a63] dark:text-teal-300" />
                <p className="mt-2 text-2xl font-extrabold text-[#006a63] dark:text-teal-300">{totalOrders}</p>
                <p className="text-xs font-semibold text-[#3c4947] dark:text-slate-300">Total Orders</p>
              </div>
              <div className="rounded-xl border border-[#00a69c]/20 bg-[#00a69c]/5 p-4 text-center dark:border-teal-700/30 dark:bg-teal-900/30">
                <PackageCheck className="mx-auto h-5 w-5 text-[#006a63] dark:text-teal-200" />
                <p className="mt-2 text-2xl font-extrabold text-[#006a63] dark:text-teal-200">{deliveredOrders}</p>
                <p className="text-xs font-semibold text-[#3c4947] dark:text-slate-300">Delivered</p>
              </div>
            </div>
          </aside>

          {/* Right Column — Edit Profile Form Card */}
          <div className="rounded-xl border border-[#006a63]/20 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-background/80 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 sm:text-2xl">
              Edit Personal Details
            </h2>
            <p className="mt-1 mb-6 text-xs text-[#3c4947] dark:text-slate-400">
              Update your account information and shipping details below.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171d1c] dark:text-slate-200">Full Name</label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-lg border border-[#bbc9c7] bg-white px-4 py-2.5 text-sm text-[#3c4947] outline-none transition focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 dark:border-slate-700 dark:bg-background/60 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171d1c] dark:text-slate-200">Email Address</label>
                <Input
                  value={email}
                  disabled
                  className="cursor-not-allowed rounded-lg border border-[#bbc9c7]/60 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 opacity-70 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171d1c] dark:text-slate-200">Phone Number</label>
                <Input
                  value={phone}
                  placeholder="+88013-1234-5678"
                  onChange={(event) => setPhone(event.target.value)}
                  className="rounded-lg border border-[#bbc9c7] bg-white px-4 py-2.5 text-sm text-[#3c4947] outline-none transition focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 dark:border-slate-700 dark:bg-background/60 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171d1c] dark:text-slate-200">City</label>
                <Input
                  value={cityInput}
                  placeholder="Dhaka"
                  onChange={(event) => setCityInput(event.target.value)}
                  className="rounded-lg border border-[#bbc9c7] bg-white px-4 py-2.5 text-sm text-[#3c4947] outline-none transition focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 dark:border-slate-700 dark:bg-background/60 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#171d1c] dark:text-slate-200">Full Shipping Address</label>
                <Input
                  value={address}
                  placeholder="123 Main St, Sector 4, Uttara"
                  onChange={(event) => setAddress(event.target.value)}
                  className="rounded-lg border border-[#bbc9c7] bg-white px-4 py-2.5 text-sm text-[#3c4947] outline-none transition focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 dark:border-slate-700 dark:bg-background/60 dark:text-slate-200 dark:focus:border-teal-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="rounded-lg bg-[#006a63] px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white"
              >
                {isSaving ? "Saving Changes…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
