"use client";

import { Bell, Globe, Lock, Eye, EyeOff, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      {/* Notification Preferences */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-[#2BB5A0]" />
            <p className="font-semibold text-[#1B2B3A]">
              Notification Preferences
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Loan offers",
                desc: "Get notified when new offers arrive",
                sms: true,
                email: true,
                push: true,
              },
              {
                label: "Payment reminders",
                desc: "Reminders before instalment due dates",
                sms: true,
                email: true,
                push: true,
              },
              {
                label: "Application updates",
                desc: "Status changes on your applications",
                sms: false,
                email: true,
                push: true,
              },
              {
                label: "Promotional offers",
                desc: "Special deals from Welend partners",
                sms: false,
                email: false,
                push: false,
              },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm text-[#1B2B3A]">
                    {pref.label}
                  </p>
                  <p className="text-xs text-gray-400">{pref.desc}</p>
                </div>
                <div className="flex gap-3">
                  {(["SMS", "Email", "Push"] as const).map((ch, i) => {
                    const isOn = [pref.sms, pref.email, pref.push][i];
                    return (
                      <button
                        key={ch}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isOn
                            ? "bg-[#E8F8F5] text-[#2BB5A0] border-[#2BB5A0]/30"
                            : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-[#2BB5A0]" />
            <p className="font-semibold text-[#1B2B3A]">Security</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5">New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div>
                <Label className="mb-1.5">Confirm Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C]">
                Update Password
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm text-[#1B2B3A]">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-400">
                    Add an extra layer of security via SMS
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-[#2BB5A0]" />
            <p className="font-semibold text-[#1B2B3A]">Preferences</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Kiswahili</SelectItem>
                  <SelectItem value="lg">Luganda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Currency Display</Label>
              <Select defaultValue="ugx">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ugx">UGX – Uganda Shilling</SelectItem>
                  <SelectItem value="usd">USD – US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="bg-white border-red-200">
        <CardContent className="p-6">
          <p className="font-semibold text-red-600 mb-1">Danger Zone</p>
          <p className="text-xs text-gray-400 mb-4">
            Deleting your account is permanent. All data including loan history
            will be erased.
          </p>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
