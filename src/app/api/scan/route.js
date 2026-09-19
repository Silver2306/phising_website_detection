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

    // Save for both logged-in users and guests
    const { data: insertedData, error } = await supabase
      .from("scans")
      .insert({
        user_id: user ? user.id : null,
        url: body.url,
        prediction: data.prediction,
        confidence: data.confidence ?? null,
        model_version: data.model_version ?? null,
        domain_info: data.domain_info ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Could not save scan:", error);
    }

    // Include the scan ID in the response so the frontend can redirect to it
    const responseData = {
      ...data,
      id: insertedData?.id || null,
    };

    return Response.json(responseData, {
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