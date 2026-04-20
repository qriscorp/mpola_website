"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, FileText, CheckCircle } from "lucide-react";

export default function LenderAccountPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          Account & Licence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your lender profile and compliance
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Licence Status
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                  BoU Licensed Lender
                </p>
                <p className="text-xs text-muted-foreground">
                  Tier IV Credit Institution · #TCI-2024-0418
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              Active
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Legal Name</Label>
              <Input defaultValue="David Mugisha" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="david@mugisha-capital.ug" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue="+256772 100 842" />
            </div>
            <div className="space-y-2">
              <Label>NIN</Label>
              <Input defaultValue="CM98041234AB7X" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              KYC Documents
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "National ID (Front & Back)",
              "Selfie with ID",
              "Proof of Address",
              "Bank Statement",
            ].map((doc) => (
              <div
                key={doc}
                className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
              >
                <span className="text-sm">{doc}</span>
                <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs">
                  Verified
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
