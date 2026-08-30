import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Dashboard from "../../components/Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  {/*CHECKS IF USER IS LOGGED IN OR NOT*/}
  if (!user) {
    redirect("/");
  }

  {/*PASSING USER*/}
  return <Dashboard user={user} />;
}

