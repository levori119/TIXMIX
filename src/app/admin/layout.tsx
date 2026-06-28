import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "./actions";

// Every route under /admin requires an authenticated admin session.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  return (
    <>
      <div className="adminbar">
        <span className="muted">🛡️ מחובר כמנהל</span>
        <form action={logoutAction}>
          <button type="submit" className="chip">
            יציאה
          </button>
        </form>
      </div>
      {children}
    </>
  );
}
