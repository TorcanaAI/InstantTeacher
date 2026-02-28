"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MAX_MB = 4;

export function PdfUploadSection({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("File must be a PDF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`PDF must be under ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setSuccess(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/books/${bookId}/pdf`, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data.error as string) || `Upload failed (${res.status})`;
        setError(msg);
        return;
      }
      setSuccess(true);
      fileInput.value = "";
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-2">
      <Label htmlFor="pdfUpload">Upload PDF (optional)</Label>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          id="pdfUpload"
          type="file"
          accept="application/pdf"
          className="max-w-xs cursor-pointer"
          disabled={uploading}
        />
        <Button type="submit" variant="secondary" size="sm" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload PDF"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Replaces any existing stored PDF. Max {MAX_MB} MB. Save the form below after uploading if you
        also changed title or content.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">PDF uploaded. View it in the library.</p>}
    </form>
  );
}
