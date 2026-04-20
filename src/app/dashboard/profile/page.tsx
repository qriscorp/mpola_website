"use client";

import {
  Camera,
  CheckCircle2,
  Shield,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-dashboard";

export default function ProfilePage() {
  const { data: user } = useUser();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">Profile & KYC</h1>
        <p className="text-gray-500 mt-1">
          Manage your personal information and verification status
        </p>
      </div>

      {/* Identity card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#2BB5A0] flex items-center justify-center text-white text-2xl font-bold">
                SN
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1B2B3A]">
                  {user?.fullName ?? "Sarah Nakato"}
                </h2>
                <Badge className="bg-emerald-50 text-emerald-600 border-0 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                <MapPin className="w-3 h-3 inline" />{" "}
                {user?.location ?? "Kampala"} · Member since{" "}
                {user?.createdAt ?? "Nov 2025"}
              </p>
            </div>

            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2BB5A0]" />
              <p className="font-semibold text-[#1B2B3A]">KYC Verification</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-0">
              Fully Verified
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">National ID</p>
              <p className="font-semibold text-sm text-[#1B2B3A] mt-1">
                {user?.nin ?? "CM98041234AB7X"}
              </p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified on 20 Nov 2025
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">Account Type</p>
              <p className="font-semibold text-sm text-[#1B2B3A] mt-1 capitalize">
                {user?.accountType ?? "Individual"}
              </p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Contact Information
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input defaultValue={user?.phone ?? "+256772 843 901"} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input defaultValue={user?.email ?? "sarah.nakato@email.com"} />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3" /> Location
              </Label>
              <Input defaultValue={user?.location ?? "Kampala"} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C]">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Linked Payment Methods */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Linked Payment Methods
            </p>
            <Button variant="outline" size="sm">
              + Add Method
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#C4A55A]" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1B2B3A]">
                  MTN Mobile Money
                </p>
                <p className="text-xs text-gray-400">+256772 ••• 901</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-0 text-xs">
                Primary
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1B2B3A]">
                  Airtel Money
                </p>
                <p className="text-xs text-gray-400">+256702 ••• 901</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
