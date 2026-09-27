import { createClient } from "../../../../../lib/supabase/server";

export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User must be logged in
    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!admin) {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    // Only allow these admin review statuses
    const allowedStatuses = [
      "verified",
      "rejected",
      "inconclusive",
    ];

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        { error: "Invalid report status" },
        { status: 400 }
      );
    }

    // Update report
    const { error } = await supabase
      .from("reports")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Report update error:", error);

      return Response.json(
        { error: error.message || "Could not update report" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Admin report API error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}