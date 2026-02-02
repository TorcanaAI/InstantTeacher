import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  const { sessionId } = await searchParams;
  if (!sessionId) redirect("/parent/dashboard");

  const t = await prisma.tutoringSession.findFirst({
    where: { id: sessionId, requestedByUserId: session.user.id },
    include: { student: true, teacher: true },
  });

  if (!t) redirect("/parent/dashboard");
  const canJoin = ["PAID", "MATCHED", "ROOM_CREATED", "STUDENT_WAITING", "TEACHER_JOINED", "IN_PROGRESS"].includes(t.status);
  if (!canJoin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment processing</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your payment may still be processing. Check your session history in a moment.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/parent/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teacherAssigned = !!t.teacherId;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment successful</CardTitle>
          <p className="text-sm text-muted-foreground">
            {teacherAssigned
              ? `Session for ${t.student.fullName} with ${t.teacher?.name ?? "your teacher"} is ready.`
              : `Session for ${t.student.fullName} is ready. A teacher will accept shortly — you can join the room now to wait.`}
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/session/${t.id}`}>Join session</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
