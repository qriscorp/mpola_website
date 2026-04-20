"use client";

import { useState, useCallback } from "react";

interface UploadState {
  progress: number;
  status: "idle" | "uploading" | "completed" | "error";
  fileName?: string;
  error?: string;
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});

  const upload = useCallback(async (file: File, key: string) => {
    setUploads((prev) => ({
      ...prev,
      [key]: { progress: 0, status: "uploading", fileName: file.name },
    }));

    // Simulate upload with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setUploads((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          progress,
          status: progress === 100 ? "completed" : "uploading",
        },
      }));
    }

    return { url: URL.createObjectURL(file), fileName: file.name };
  }, []);

  const reset = useCallback((key: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { uploads, upload, reset };
}
