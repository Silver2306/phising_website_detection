# PhisSafe — Supabase Integration Guide

This guide walks you through connecting the app to your Supabase database, step by step.
Each step explains **what** you're doing, **why**, and **exactly what to write**.

---

## Before you start

You already have:
- ✅ Supabase project set up
- ✅ Tables created (`scans`, `reports`, `admins`) with RLS policies
- ✅ Supabase client helpers in `src/lib/supabase/client.js` (browser) and `src/lib/supabase/server.js` (server)

---

## Step 1 — Save a scan to the database

**File:** `src/app/api/scan/route.js`

### What this step does
Right now, when a user scans a URL, the app calls your Flask model and shows the result — but nothing gets saved. After this step, every scan by a logged-in user will be stored in the `scans` table.

### Why here?
The `/api/scan` route is the server-side middleman between the frontend and Flask. It already receives the result from Flask, so it's the perfect place to also write that result to the database — before sending it back to the browser.

### Why only for logged-in users?
Guests don't have a `user_id`, so we can't associate a scan with them. We check if there's a session, and if not, we still return the result — we just skip the DB write.

### What to write

```js
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Call Flask as before
    const response = await fetch("http://localhost:5000/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.error || "Scan failed." }, { status: response.status });
    }

    // 2. Check if there's a logged-in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 3. If logged in, save the scan to the database
    if (user) {
      await supabase.from("scans").insert({
        user_id:       user.id,
        url:           body.url,
        prediction:    data.prediction,
        confidence:    data.confidence    ?? null,  // nullable for now
        model_version: data.model_version ?? null,  // nullable for now
      });
      // Note: we don't throw if the insert fails — the scan result
      // is still shown to the user. Log the error silently.
    }

    // 4. Return the result to the frontend as normal
    return Response.json(data, { status: 200 });

  } catch (error) {
    console.error("Scan proxy error:", error);
    return Response.json({ error: "Could not connect to the scanning service." }, { status: 500 });
  }
}
```

### Key decisions explained
- **We don't block the response if the DB insert fails.** The user should always get their result back. A DB write error is logged but doesn't ruin the scan.
- **`confidence` and `model_version` are `?? null`** because Flask doesn't send these yet. When Flask is updated to return them, they'll automatically start being saved.

---

## Step 2 — Submit a report to the database

**File:** `src/components/ReportURL.jsx`

### What this step does
The report form currently validates the input and shows a "ready to submit" message, but doesn't actually save anything. After this step, clicking "Submit to Review Queue" inserts a row into the `reports` table.

### Why client-side?
The `ReportURL` component is a client component (`"use client"`), and the user is always logged in when they reach this page (the page is auth-gated). So we can use the browser Supabase client directly.

### What to write

Add the import at the top:
```js
import { createClient } from "../lib/supabase/client";
```

Replace `handleSubmit` with:
```js
async function handleSubmit(e) {
  e.preventDefault();
  setMessage("");

  if (!reportUrl.trim()) {
    setMessage("Please enter a URL.");
    return;
  }
  if (!category) {
    setMessage("Please select a report category.");
    return;
  }

  const supabase = createClient();

  const { error } = await supabase.from("reports").insert({
    user_id:  user.id,
    url:      reportUrl.trim(),
    category: category,
    context:  context.trim() || null,  // store null if empty, not an empty string
  });

  if (error) {
    setMessage("Something went wrong. Please try again.");
    console.error(error);
    return;
  }

  setMessage("Report submitted successfully. Thank you!");
}
```

### Key decisions explained
- **`context` is stored as `null` when empty** rather than an empty string `""`. This keeps the data clean — you can easily filter for `context IS NOT NULL` in queries later.
- **`user.id` comes from the prop** passed by the page (`<ReportURL user={user} />`), so no extra Supabase auth call is needed here.

---

## Step 3 — Show real stats on the Dashboard

**File:** `src/app/dashboard/page.jsx`

### What this step does
The Dashboard currently shows hardcoded `0` for "Total Scans Executed" and "Phishing Threats Blocked". After this step, those numbers come from the real `scans` table.

### Why server-side?
The Dashboard page is a server component. That means it runs on the server before the page is sent to the browser. Fetching data on the server means the numbers are already there when the page loads — no loading spinner needed.

### What to write

In `page.jsx`, fetch the stats and pass them as props to `<Dashboard />`:

```js
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Count total scans for this user
  const { count: totalScans } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Count how many of those were phishing
  const { count: threatsBlocked } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("prediction", "phishing");

  return (
    <Dashboard
      user={user}
      totalScans={totalScans ?? 0}
      threatsBlocked={threatsBlocked ?? 0}
    />
  );
}
```

Then in `Dashboard.jsx`, receive and display the props:
```js
export default function Dashboard({ user, totalScans, threatsBlocked }) {
  // Replace the hardcoded 0s:
  // <p className="text-3xl font-bold text-black">{totalScans}</p>
  // <p className="text-3xl font-bold text-red-600">{threatsBlocked}</p>
}
```

### Key decisions explained
- **`{ count: "exact", head: true }`** tells Supabase to return only the count, not the actual rows. This is efficient — we don't fetch all scan data just to count it.
- **`?? 0`** is a safety fallback in case the query returns `null` (e.g. first time user, no scans yet).

---

## Step 4 — Load scan history on the History page

**File:** `src/app/history/page.jsx` and `src/components/History.jsx`

### What this step does
The History page exists but the `History` component doesn't display any data yet. After this step, it shows the user's past scans in reverse chronological order (newest first).

### Why server-side?
Same reason as Step 3 — fetch the data on the server, pass it as a prop, no loading states needed.

### What to write

In `page.jsx`:
```js
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: scans } = await supabase
    .from("scans")
    .select("id, url, prediction, confidence, model_version, scanned_at")
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false });

  return <History scans={scans ?? []} />;
}
```

In `History.jsx`, receive the `scans` prop and render the list. Each row shows:
- The URL
- Whether it was `phishing` or `legitimate`
- The date/time it was scanned

### Key decisions explained
- **We `select` only the columns we need** rather than `select("*")`. This keeps the response payload small.
- **`.order("scanned_at", { ascending: false })`** gives newest scans first (descending date order).
- **`scans ?? []`** means if the query somehow returns null, the component gets an empty array and renders a "no history" message rather than crashing.

---

## Summary

| Step | File(s) | What it wires up |
|------|---------|-----------------|
| 1 | `api/scan/route.js` | Save scan result to `scans` table |
| 2 | `ReportURL.jsx` | Save report form to `reports` table |
| 3 | `dashboard/page.jsx` + `Dashboard.jsx` | Real stats from `scans` |
| 4 | `history/page.jsx` + `History.jsx` | Real scan list from `scans` |

> [!TIP]
> Do these steps in order — Step 1 must be done first because Steps 3 and 4 depend on there being data in the `scans` table.

> [!NOTE]
> At no point do you need to expose your Supabase service-role key to the browser. The browser client uses the **anon key** (safe to expose) and RLS ensures users can only access their own data. The service-role key is only used server-side if you ever need to bypass RLS (e.g. admin actions).
