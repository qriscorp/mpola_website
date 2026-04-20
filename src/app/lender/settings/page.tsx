"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, Shield, Key } from "lucide-react";

export default function LenderSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your lending preferences
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Lending Criteria
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Min Loan Amount (UGX)</Label>
              <Input type="number" defaultValue="1000000" />
            </div>
            <div className="space-y-2">
              <Label>Max Loan Amount (UGX)</Label>
              <Input type="number" defaultValue="50000000" />
            </div>
            <div className="space-y-2">
              <Label>Preferred Duration (months)</Label>
              <Input defaultValue="12-24" />
            </div>
            <div className="space-y-2">
              <Label>Target Interest Rate (%)</Label>
              <Input type="number" defaultValue="14" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Notifications
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "New borrower matches",
            "Repayment received",
            "Loan status updates",
            "Weekly portfolio digest",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
            >
              <span className="text-sm">{item}</span>
              <Badge className="bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10">
                Enabled
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Security
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Change Password</Label>
              <Input type="password" placeholder="New password" />
            </div>
            <div className="space-y-2">
              <Label>2FA</Label>
              <div className="flex items-center gap-2 pt-2">
                <Badge className="bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10">
                  <Key className="h-3 w-3 mr-1" /> Enabled
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
