"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS, YEAR_LEVELS } from "@/lib/constants";
import { addStudent } from "@/app/actions/student";

export default function NewStudentPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [schoolYear, setSchoolYear] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("subjects", JSON.stringify(subjects));
    if (schoolYear) formData.set("schoolYear", schoolYear);
    const result = await addStudent(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/parent/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Add a student</CardTitle>
            <CardDescription>
              Add your child so you can book sessions for them. School name is required for safety (conflict-of-interest).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" placeholder="Sam Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolYear">Year level</Label>
                <Select value={schoolYear} onValueChange={setSchoolYear} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_LEVELS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="schoolYear" value={schoolYear} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  placeholder="e.g. Perth Modern School"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.slice(0, 8).map((s) => (
                    <label key={s} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={subjects.includes(s)}
                        onChange={(e) =>
                          setSubjects((prev) =>
                            e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                          )
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Add student
              </Button>
            </form>
            <p className="mt-4 text-center">
              <Link href="/parent/dashboard" className="text-sm text-muted-foreground underline">
                Back to dashboard
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
