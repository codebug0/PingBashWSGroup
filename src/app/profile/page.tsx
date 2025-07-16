'use client'

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomerProfile from "@/components/profile/customerProfile";
import VendorProfile from "@/components/profile/vendorProfile";
import PreLoading from "@/components/mask/preLoading";

interface ProfileContentProps { }

const ProfileContent: React.FC<ProfileContentProps> = () => {
  const params = useSearchParams();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(params.get("Role"));
  }, []);

  return role === "Vendor" ? <VendorProfile /> : <CustomerProfile />;
};

interface MyProfileProps { }

const MyProfile: React.FC<MyProfileProps> = () => {
  return (
    <Suspense fallback={<PreLoading />}>
      <ProfileContent />
    </Suspense>
  );
};

export default MyProfile;