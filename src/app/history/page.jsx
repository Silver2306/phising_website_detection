import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";

import History from "../../components/History";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: scans, error } = await supabase
    .from("scans")
    .select(
      "id, url, prediction, confidence, model_version, scanned_at"
    )
    .eq("user_id", user.id)
    .order("scanned_at", {
      ascending: false,
    });

  if (error) {
    console.error("History error:", error);
  }

  return (
    <History
      user={user}
      scans={scans ?? []}
    />
  );
}