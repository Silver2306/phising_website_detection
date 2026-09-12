import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

import ScanResult from "../../../components/ScanResult";

// Authenticated users only. Guests have their own route at /guest/result.
export default async function ScanResultPage({ searchParams }) {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const params = await searchParams;
  const url = params.url || "";

  return <ScanResult url={url} isGuest={false} />;
}