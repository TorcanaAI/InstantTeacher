"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteBook } from "../actions/books";

type BookRow = { id: string; title: string; yearLevel: number; contentText: string; pdfUrl: string | null };

export function AdminBooksClient({
  books,
}: {
  books: BookRow[];
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteBook(id);
      window.location.reload();
    } finally {
      setDeletingId(null);
    }
  }

  if (books.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No books yet. Add a book to get started.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="p-3 text-left font-medium">Title</th>
          <th className="p-3 text-left font-medium">Year</th>
          <th className="p-3 text-left font-medium">Content length</th>
          <th className="p-3 text-left font-medium">PDF</th>
          <th className="p-3 text-left font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map((b) => (
          <tr key={b.id} className="border-b">
            <td className="p-3 font-medium">{b.title}</td>
            <td className="p-3">{b.yearLevel}</td>
            <td className="p-3 text-muted-foreground">{b.contentText.length} chars</td>
            <td className="p-3">
              {b.pdfUrl ? (
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={`/admin/books/${b.id}/pdf-view`} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </Link>
                </Button>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
            <td className="p-3 flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/books/${b.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                disabled={deletingId === b.id}
                onClick={() => handleDelete(b.id)}
              >
                {deletingId === b.id ? "Deleting…" : "Delete"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
