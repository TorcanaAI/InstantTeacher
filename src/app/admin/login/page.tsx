import { redirect } from "next/navigation";

/** Legacy URL: admin login moved to /auth/login (public). */
export default function AdminLoginRedirect() {
  redirect("/auth/login");
}
