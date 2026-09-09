"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

import {
  FaShieldHalved,
  FaLink,
  FaMicroscope,
  FaRightFromBracket,
} from "react-icons/fa6";

import { LiaFishSolid } from "react-icons/lia";

export default function Dashboard({ user }) {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Get logged-in user's name
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  // Make initials from user's name
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Logout
  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  // URL form
  async function handleScan(e) {
    e.preventDefault();

    const finalUrl = url.trim();

    if (!finalUrl) {
      setMessage("Please enter a URL.");
      return;
    }

    try {
      setIsScanning(true);
      setMessage("Scanning...");

      const response = await fetch(
        "http://localhost:5000/scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: finalUrl,
          }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Scan failed.");
        return;
      }

      // Redirect to results page
      router.push(
        `/scan/result?url=${encodeURIComponent(finalUrl)}&prediction=${encodeURIComponent(result.prediction)}`
      );

    } catch (error) {
      setMessage("Could not connect to the scanning service.");
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <LiaFishSolid className="text-red-600 text-2xl" />
            <h1 className="font-semibold text-black text-lg">PhisSafe Dashboard</h1>
          </div>

          {/* Logged-in User */}
          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-black">{name}</p>

              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* User Initials */}
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">{initials}</div>

            {/* Logout */}
            <button
              onClick={handleLogout} disabled={isScanning} className="flex items-center gap-2 text-gray-600 hover:text-red-600">
              <FaRightFromBracket />
              <span className="hidden sm:block">Logout</span>
            </button>

          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Section */}
          <div className="flex-1">

            {/* URL Scanner */}
            <div className="bg-red-700 text-white rounded-xl p-8 mb-6">

              <h1 className="text-2xl font-bold">
                Target URL Analysis
              </h1>

              <p className="mt-2 mb-6">
                Submit a fully qualified domain name (FQDN)
                or exact URL for evaluation against our
                phishing detection system.
              </p>

              <form onSubmit={handleScan}>

                <div className="bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2">

                  {/* URL Input */}
                  <div className="relative flex-1">

                    <FaLink className="absolute left-4 top-4 text-gray-500" />

                    <input type="text" placeholder="https://example.com" value={url} className="w-full h-12 pl-11 pr-4 rounded-lg text-black outline-none"
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setMessage("");
                      }} />

                  </div>

                  {/* Scan Button */}
                  <button type="submit" disabled={isScanning}
                    className="h-12 bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg font-semibold flex justify-center items-center gap-2">
                    {isScanning ? "" : <FaMicroscope />}
                    {isScanning ? "Scanning..." : "Initiate Scan"}
                  </button>

                </div>

              </form>

              {/* Validation Message */}
              {message && (
                <p className="mt-3 text-sm text-white">
                  {message}
                </p>
              )}

            </div>
            {/* Detection Pipeline */}
            <h2 className="font-semibold text-black mb-4">Detection Pipeline Stages</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Phase 1 */}
              <div className="bg-white border rounded-xl p-5 shadow-2xl">

                <p className="text-xs font-semibold text-red-600">PHASE 01</p>

                <h3 className="font-semibold text-black mt-2">URL Structure</h3>

                <p className="text-sm text-gray-500 mt-2">Lexical entropy & typosquatting detection.</p>

              </div>
              {/* Phase 2 */}
              <div className="bg-white border rounded-xl p-5 shadow-2xl">

                <p className="text-xs font-semibold text-red-600">PHASE 02</p>

                <h3 className="font-semibold text-black mt-2">Domain & SSL</h3>

                <p className="text-sm text-gray-500 mt-2">Registration records & certificate validation.</p>

              </div>

              {/* Phase 3 */}
              <div className="bg-white border rounded-xl p-5 shadow-2xl">

                <p className="text-xs font-semibold text-red-600">PHASE 03</p>

                <h3 className="font-semibold text-black mt-2">HTML Parsing</h3>

                <p className="text-sm text-gray-500 mt-2">Safe extraction of forms and external links.</p>

              </div>

            </div>

          </div>

          {/* Right Statistics */}
          <div className="w-full lg:w-72">

            <div className="bg-white border rounded-xl p-6">

              <h2 className="text-sm font-semibold text-gray-500">YOUR STATISTICS</h2>

              {/* Total Scans */}
              <div className="mt-6">

                <p className="text-3xl font-bold text-black">0</p>

                <p className="text-sm text-gray-500 mt-1">Total Scans Executed</p>

              </div>

              {/* Threats */}
              <div className="mt-6">

                <p className="text-3xl font-bold text-red-600">0</p>

                <p className="text-sm text-gray-500 mt-1">
                  Phishing Threats Blocked
                </p>

              </div>

              <hr className="my-6" />

              {/* History */}
              <button onClick={() => router.push("/history")} className="w-full border rounded-lg py-3 text-gray-500 hover:text-red-600">
                View Full History
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}