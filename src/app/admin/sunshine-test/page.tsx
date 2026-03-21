import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SunshineTestClient from "./SunshineTestClient";

export default async function AdminSunshineTestPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sunshine voice test</h1>
      <p className="text-muted-foreground">
        Admin-only. Use <strong>Ask Sunshine</strong> to ask questions (OpenAI + voice) or <strong>Type & Speak</strong> to hear any text in the Sunshine voice. No payment.
      </p>
      <p className="mt-2 text-sm text-amber-700">
        To test read-along (Sunshine reads aloud), use the reading test — pick a book and open it to try &quot;Have Sunshine read aloud&quot;.
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/admin/sunshine-reading-test">Test Sunshine Reading (Test Student)</Link>
        </Button>
      </div>
      <div className="mt-6">
        <SunshineTestClient />
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <Link href="/admin/sunshine">Back to Sunshine usage</Link>
      </Button>
    </div>
  );
}
