import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export default async function SunshineCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; studentId?: string; bookId?: string }>;
}) {
  const params = await searchParams;
  const type = params.type;
  const studentId = params.studentId;
  const bookId = params.bookId;
  const label =
    type === "question_block"
      ? "5 questions"
      : type === "reading_session"
        ? "Reading session"
        : "Sunshine";

  const readingStartUrl =
    type === "reading_session" && studentId
      ? `/reading?studentId=${encodeURIComponent(studentId)}${bookId ? `&bookId=${encodeURIComponent(bookId)}` : ""}`
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-amber-500" />
            <CardTitle>Payment successful</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Your {label} is ready. You can use it from any subject portal.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {readingStartUrl && (
            <Button asChild className="w-full">
              <Link href={readingStartUrl}>Start reading with Sunshine</Link>
            </Button>
          )}
          <Button asChild variant={readingStartUrl ? "outline" : "default"} className="w-full">
            <Link href="/parent/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/help/study">Choose a subject</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
