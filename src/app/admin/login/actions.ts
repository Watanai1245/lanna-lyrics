"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword } from "@/lib/auth";
import { setAdminSession } from "@/lib/adminSession";

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  const nextParam = String(formData.get("next") || "/admin/songs");
  const next = nextParam.startsWith("/admin") ? nextParam : "/admin/songs";

  if (!checkAdminPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setAdminSession();
  redirect(next);
}
