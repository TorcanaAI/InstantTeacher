import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookForm } from "../BookForm";
import { createBook } from "../../actions/books";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminNewBookPage() {
  async function action(formData: FormData) {
    "use server";
    await createBook({
      title: (formData.get("title") as string) ?? "",
      yearLevel: parseInt((formData.get("yearLevel") as string) ?? "1", 10),
      contentText: (formData.get("contentText") as string) ?? "",
      pdfUrl: (formData.get("pdfUrl") as string) || null,
    });
    redirect("/admin/books");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Book</CardTitle>
          <p className="text-sm text-muted-foreground">Title, year level (1–5), and text content (paste story/passage).</p>
        </CardHeader>
        <CardContent>
          <BookForm action={action} />
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin/books">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
