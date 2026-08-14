"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
}

/** Text-input counterpart to ConfirmModal — replaces window.prompt() for
 * cases that need a short reason/note, not just a yes/no. */
export function PromptModal({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  required = false,
  confirmLabel = "Submit",
  onSubmit,
}: PromptModalProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
            <MessageSquare className="h-6 w-6 text-blue-500" />
          </div>
          <DialogTitle className="text-center text-[#1B2B3A] dark:text-white">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center">{description}</DialogDescription>
          )}
        </DialogHeader>
        <Textarea
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <div className="flex flex-col gap-3 mt-4">
          <Button
            className="w-full bg-[#2BB5A0] hover:bg-[#239E8C]"
            disabled={required && !value.trim()}
            onClick={() => onSubmit(value.trim())}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
