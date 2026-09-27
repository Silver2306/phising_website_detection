import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import ScanResult from "../../../components/ScanResult";

export const metadata = {
  title: "PhisSafe — Scan Result (Guest)",
  description: "Your phishing scan result.",
};

// No auth check — this route is intentionally public for guest users.
export default async function GuestResultPage({ params }) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();
  const { data: scan } = await supabase
  .from("scans")
  .select("*")
  .eq("id", id)
  .is("user_id", null)
  .single();

  if (!scan) {
    notFound();
  }

  return (
    <ScanResult
      url={scan.url}
      prediction={scan.prediction}
      domainInfo={scan.domain_info}
      features={scan.features}
      score={scan.confidence || "--"}
      modelVersion={scan.model_version}
      databaseCheck={scan.domain_info?.database_check}
      isGuest={true}
    />
  );
}
