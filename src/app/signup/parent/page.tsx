import { redirect } from "next/navigation";

/**
 * Direct link to parent signup — redirects to unified flow with role=parent.
 * Keeps existing links (e.g. from homepage) working.
 */
export default function SignupParentPage() {
  redirect("/signup?role=parent");
}
