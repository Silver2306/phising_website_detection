import { redirect, notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import ScanResult from "../../../components/ScanResult";

export default async function ScanResultPage({ params }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
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
      scannedAt={scan.scanned_at}
      isGuest={false}
    />
  );
}