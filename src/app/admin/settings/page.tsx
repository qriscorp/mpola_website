"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
          Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure Mpola platform settings
        </p>
      </div>

      {/* General */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              General
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="Mpola Uganda" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@mpola.ug" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="UGX" disabled />
            </div>
            <div className="space-y-2">
              <Label>Licence Number</Label>
              <Input defaultValue="TCI-2024-0418" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Configuration */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Loan Configuration
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Loan Amount (UGX)</Label>
              <Input type="number" defaultValue="500000" />
            </div>
            <div className="space-y-2">
              <Label>Maximum Loan Amount (UGX)</Label>
              <Input type="number" defaultValue="100000000" />
            </div>
            <div className="space-y-2">
              <Label>Max Interest Rate (%)</Label>
              <Input type="number" defaultValue="25" />
            </div>
            <div className="space-y-2">
              <Label>Late Payment Penalty (%)</Label>
              <Input type="number" defaultValue="2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Notification Settings
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Email notifications for new applications",
            "SMS alerts for overdue payments",
            "Weekly performance digest",
            "Real-time alerts for defaults",
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

      {/* Security */}
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
              <Label>Admin Password</Label>
              <Input type="password" defaultValue="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>2FA Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <Badge className="bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10">
                  <Key className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Export All Data
              </p>
              <p className="text-xs text-muted-foreground">
                Download complete platform data as CSV
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Platform Maintenance Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Temporarily disable user access
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
