import { redirect } from "next/navigation";

/**
 * Direct link to teacher signup — redirects to unified flow with role=teacher.
 * Keeps existing links (e.g. from homepage) working.
 */
export default function SignupTeacherPage() {
  redirect("/signup?role=teacher");
}
