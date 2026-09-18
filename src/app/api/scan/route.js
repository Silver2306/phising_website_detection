import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Call Flask
    const response = await fetch("http://localhost:5000/scan-cp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Flask returned an error
    if (!response.ok) {
      return Response.json(
        {
          error: data.error || "Scan failed.",
        },
        {
          status: response.status,
        }
      );
    }

    // Check whether user is logged in
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Save only for logged-in users
    if (user) {
      const { error } = await supabase
        .from("scans")
        .insert({
          user_id: user.id,
          url: body.url,
          prediction: data.prediction,
          confidence: data.confidence ?? null,
          model_version: data.model_version ?? null,
        });

      // Scan should still work even if DB insert fails
      if (error) {
        console.error("Could not save scan:", error);
      }
    }

    return Response.json(data, {
      status: 200,
    });

  } catch (error) {
    console.error("Scan proxy error:", error);

    return Response.json(
      {
        error: "Could not connect to the scanning service.",
      },
      {
        status: 500,
      }
    );
  }
}