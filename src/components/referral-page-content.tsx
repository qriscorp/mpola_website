"use client";

import { useState } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/skeletons";
import { useReferralInfo } from "@/hooks/use-support";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10", solid: "bg-[#2BB5A0] hover:bg-[#239E8C]" },
  gold: { text: "text-[#C4A55A]", bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10", solid: "bg-[#C4A55A] hover:bg-[#b3944a]" },
};

export function ReferralPageContent({ accent }: { accent: "teal" | "gold" }) {
  const { data, isLoading } = useReferralInfo();
  const [copied, setCopied] = useState(false);
  const colors = ACCENT[accent];

  const handleCopy = () => {
    if (!data?.referral_link) return;
    navigator.clipboard.writeText(data.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <CardSkeleton count={2} height="h-40" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${colors.bg}`}>
            <Gift className={`h-7 w-7 ${colors.text}`} />
          </div>
          <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
            Invite friends to Mpola
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Share your referral link — anyone who signs up with it is linked to
            your account.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto">
            <div className="flex-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm font-mono text-[#1B2B3A] dark:text-white truncate">
              {data?.referral_link}
            </div>
            <Button onClick={handleCopy} className={`w-full sm:w-auto gap-2 text-white ${colors.solid}`}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Your code:{" "}
            <span className="font-mono font-semibold text-[#1B2B3A] dark:text-white">
              {data?.referral_code}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 ${colors.text}`} />
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
              People you&apos;ve referred ({data?.total_referred ?? 0})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          {!data?.referred_users?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No referrals yet — share your link to get started.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.referred_users.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-[#1B2B3A] dark:text-white">
                    {u.full_name ?? "Mpola user"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {u.role} · joined {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
