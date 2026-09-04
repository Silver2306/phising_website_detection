import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

import ScanResult from "../../../components/ScanResult";

export default async function ScanResultPage({ searchParams }) {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check login
  if (!user) {
    redirect("/");
  }

  // Get URL sent from dashboard
  const params = await searchParams;

  const url = params.url || "";

  return <ScanResult url={url} />;
}