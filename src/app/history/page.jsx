import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";

import History from "../../components/History";

export default async function HistoryPage() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  {/* CHECK IF USER IS LOGGED IN */}
  if (!user) {
    redirect("/");
  }

  return <History/>;
}