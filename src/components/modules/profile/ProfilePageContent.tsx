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
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-emerald-700">My Profile</h1>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border bg-card p-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-full border">
                {profileImagePreview ? (
                  <AvatarImage src={profileImagePreview} alt={profileState.name || "User"} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserCircle2 className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
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
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-700">{profileState.name || "User"}</h2>
            <p className="text-teal-600 mt-1 text-sm font-medium">{profileState.email || "N/A"}</p>
            <Badge className="mt-2 bg-emerald-600 text-white">{role}</Badge>
            {isUploadingImage ? (
              <p className="text-muted-foreground mt-2 text-xs">Uploading image...</p>
            ) : null}
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
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-center text-white shadow-md hover:shadow-lg transition-shadow">
              <ShoppingBag className="text-white mx-auto h-5 w-5" />
              <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
              <p className="text-emerald-100 text-sm font-medium">Orders</p>
            </div>
            <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-center text-white shadow-md hover:shadow-lg transition-shadow">
              <PackageCheck className="text-white mx-auto h-5 w-5" />
              <p className="mt-2 text-2xl font-bold">{deliveredOrders}</p>
              <p className="text-teal-100 text-sm font-medium">Delivered</p>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-700">Edit Profile</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emerald-700">Full Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emerald-700">Email</label>
                <Input value={email} disabled className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emerald-700">Phone</label>
                <Input
                  value={phone}
                  placeholder="Phone number"
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emerald-700">City</label>
                <Input
                  value={cityInput}
                  placeholder="City"
                  onChange={(event) => setCityInput(event.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-emerald-700">Address</label>
                <Input
                  value={address}
                  placeholder="Address"
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
            </div>

            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" type="button" onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
