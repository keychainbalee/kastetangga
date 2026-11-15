import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginClient from "@/components/LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.role === "admin") {
    redirect("/admin");
  }

  return <LoginClient currentUser={session} />;
}
