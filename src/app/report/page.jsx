import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import ReportURL from "../../components/ReportURL";

export default async function ReportPage({ searchParams }) {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  {/* CHECK IF USER IS LOGGED IN */}
  if (!user) {
    redirect("/");
  }

  {/* GET URL FROM SCAN RESULT PAGE */}

  const params = await searchParams;
  const url = params.url || "";
  return (
    <ReportURL
      url={url}
      user={user}
    />
  );
}