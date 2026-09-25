import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";
import Admin from "../../components/Admin";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check admin access
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/dashboard");
  }

  // Get all reports
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      "id, user_id, url, category, context, status, submitted_at, reviewed_at"
    )
    .order("submitted_at", {
      ascending: false,
    });

  if (error) {
    console.error("Admin reports error:", error);
  }

  return (
    <Admin
      user={user}
      reports={reports ?? []}
    />
  );
}