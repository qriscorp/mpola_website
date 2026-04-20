"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lf_apply_wizard";

interface WizardState {
  step: number;
  amount: number;
  duration: number;
  loanType: "personal" | "business";
  purpose: string;
  description: string;
  uploadedDocs: Record<string, boolean>;
  selectedLenders: string[];
}

const defaultState: WizardState = {
  step: 0,
  amount: 8000000,
  duration: 18,
  loanType: "business",
  purpose: "Business expansion",
  description:
    "Expanding my salon in Ntinda — adding 2 stations and new equipment",
  uploadedDocs: {
    national_id: true,
    payslips: true,
    bank_statement: true,
    passport_photo: true,
    trading_licence: true,
  },
  selectedLenders: ["lender_001", "lender_002", "lender_004"],
};

export function useWizardPersistence() {
  const [state, setState] = useState<WizardState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const save = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(defaultState);
  }, []);

  return { state, save, clear, hydrated };
}
