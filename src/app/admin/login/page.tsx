import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginRedirect from "./login-redirect";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");
  return <LoginRedirect />;
}
