"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Send } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/skeletons";
import { useMyDisputes, useFileDispute } from "@/hooks/use-support";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", solid: "bg-[#2BB5A0] hover:bg-[#239E8C]" },
  gold: { text: "text-[#C4A55A]", solid: "bg-[#C4A55A] hover:bg-[#b3944a]" },
};

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  investigating: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

const categoryLabel: Record<string, string> = {
  payment: "Payment",
  loan_terms: "Loan Terms",
  fraud: "Fraud",
  disbursement: "Disbursement",
  other: "Other",
};

export function DisputesPageContent({ accent }: { accent: "teal" | "gold" }) {
  const colors = ACCENT[accent];
  const { data: disputes, isLoading } = useMyDisputes();
  const fileDispute = useFileDispute();

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("payment");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (description.trim().length < 10) return;
    fileDispute.mutate(
      { category, description },
      {
        onSuccess: () => {
          setDescription("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${colors.text}`} />
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
            Disputes
          </h3>
        </div>
        <Button size="sm" className={`gap-2 text-white ${colors.solid}`} onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          File a Dispute
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use this if something went wrong with a specific loan, repayment, or
          disbursement — our team reviews every dispute filed here.
        </p>

        {showForm && (
          <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="loan_terms">Loan Terms</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="disbursement">Disbursement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Describe what happened in as much detail as you can (at least 10 characters)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <Button
              className={`gap-2 text-white ${colors.solid}`}
              disabled={fileDispute.isPending || description.trim().length < 10}
              onClick={handleSubmit}
            >
              <Send className="h-4 w-4" />
              {fileDispute.isPending ? "Submitting…" : "Submit Dispute"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <CardSkeleton count={2} height="h-24" />
        ) : !disputes?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No disputes filed.
          </p>
        ) : (
          <StaggerList className="divide-y divide-gray-100 dark:divide-gray-800">
            {disputes.map((d) => (
              <StaggerItem key={d.id} className="py-4 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabel[d.category] ?? d.category}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${statusColor[d.status] ?? ""}`}>
                    {d.status}
                  </Badge>
                </div>
                <p className="text-sm text-[#1B2B3A] dark:text-white">{d.description}</p>
                {d.resolution_note && (
                  <p className="text-xs text-muted-foreground">
                    Resolution: {d.resolution_note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Filed {new Date(d.created_at).toLocaleDateString()}
                </p>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </CardContent>
    </Card>
  );
}
