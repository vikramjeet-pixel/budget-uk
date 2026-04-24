import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__fb_token")?.value;

  if (!token) redirect("/");

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    redirect("/");
  }

  const userDoc = await adminDb.collection("users").doc(uid).get();
  const role = userDoc.data()?.role;

  if (role !== "moderator" && role !== "admin") redirect("/");

  return <AdminDashboard />;
}
