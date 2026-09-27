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

    // Check if domain is in admin-verified blacklist reports
    let databaseCheckStatus = "Not Found in DB";
    if (body.url) {
      try {
        const targetDomain = body.url
          .replace(/^https?:\/\//i, "")
          .split("/")[0]
          .toLowerCase();

        const { data: verifiedReports } = await supabase
          .from("reports")
          .select("id, url")
          .eq("status", "verified");

        if (verifiedReports && verifiedReports.length > 0) {
          const isBlacklisted = verifiedReports.some((report) => {
            if (!report.url) return false;
            const reportDomain = report.url
              .replace(/^https?:\/\//i, "")
              .split("/")[0]
              .toLowerCase();
            return reportDomain === targetDomain;
          });

          if (isBlacklisted) {
            databaseCheckStatus = "Blacklisted (Admin Verified)";
            // Override prediction for admin-verified threat
            data.prediction = "phishing";
            data.confidence = 1.0;
          }
        }
      } catch (err) {
        console.error("Blacklist lookup error:", err);
      }
    }

    const updatedDomainInfo = {
      ...(data.domain_info || {}),
      database_check: databaseCheckStatus,
    };

    // Save for both logged-in users and guests
    const { data: insertedData, error } = await supabase
      .from("scans")
      .insert({
        user_id: user ? user.id : null,
        url: body.url,
        prediction: data.prediction,
        confidence: data.confidence ?? null,
        model_version: data.model_version ?? null,
        features: data.features ?? null,
        domain_info: updatedDomainInfo,
      })
      .select()
      .single();

    if (error || !insertedData) {
      console.error("Could not save scan:", error);

     return Response.json(
        {
          error: "Scan completed, but the result could not be saved.",
        },
        {
          status: 500,
      }
    );
    }

    const responseData = {
      ...data,
      domain_info: updatedDomainInfo,
      id: insertedData.id,
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