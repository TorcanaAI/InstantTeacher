"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  callbackUrl?: string;
};

export default function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
  children = "Sign out",
  callbackUrl = "/",
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl })}
    >
      {children}
    </Button>
  );
}
