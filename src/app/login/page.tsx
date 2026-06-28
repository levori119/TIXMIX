import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin/settings");

  return (
    <main className="container narrow">
      <div className="page-head">
        <span className="crumb">TixMix · ניהול</span>
        <h1 className="page-title">כניסת מנהל 🔐</h1>
      </div>

      <div className="card">
        <LoginForm />
      </div>
    </main>
  );
}
