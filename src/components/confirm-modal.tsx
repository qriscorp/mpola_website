"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
}

/** Generic "Are you sure?" dialog — used anywhere an action needs an
 * explicit confirm step (freeze, withdraw, etc.) instead of firing on
 * click or falling back to the browser's native confirm(). */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading = false,
  destructive = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={`mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center ${
              destructive
                ? "bg-red-50 dark:bg-red-900/20"
                : "bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${destructive ? "text-red-500" : "text-blue-500"}`}
            />
          </div>
          <DialogTitle className="text-center text-[#1B2B3A] dark:text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? "w-full" : "w-full bg-[#2BB5A0] hover:bg-[#239E8C]"}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
