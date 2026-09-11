"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FaShieldHalved,
  FaLink,
  FaMicroscope,
  FaUserSlash,
} from "react-icons/fa6";

import { LiaFishSolid } from "react-icons/lia";

export default function GuestDashboard() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // URL scan handler — identical to the authenticated Dashboard.
  // No user ID is sent; the backend does not require auth to scan.
  // No DB write happens here — result is only shown via query params.
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

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Scan failed.");
        return;
      }

      // guest=true tells the result page to show the upsell nudge.
      router.push(
        `/scan/result?url=${encodeURIComponent(finalUrl)}&prediction=${encodeURIComponent(result.prediction)}&guest=true`
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
            <h1 className="font-semibold text-black text-lg">PhisSafe</h1>
          </div>

          {/* Guest label + Sign In CTA */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm text-gray-400 border border-dashed border-gray-300 rounded-full px-3 py-1">
              Guest Mode
            </span>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Sign In / Register
            </button>
          </div>

        </div>
      </header>

      {/* Dashboard body */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Section */}
          <div className="flex-1">

            {/* URL Scanner */}
            <div className="bg-red-700 text-white rounded-xl p-8 mb-6">

              <h2 className="text-2xl font-bold">Target URL Analysis</h2>

              <p className="mt-2 mb-6">
                Submit a fully qualified domain name (FQDN) or exact URL for
                evaluation against our phishing detection system.
              </p>

              <form onSubmit={handleScan}>
                <div className="bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2">

                  {/* URL Input */}
                  <div className="relative flex-1">
                    <FaLink className="absolute left-4 top-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      className="w-full h-12 pl-11 pr-4 rounded-lg text-black outline-none"
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setMessage("");
                      }}
                    />
                  </div>

                  {/* Scan Button */}
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="h-12 bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg font-semibold flex justify-center items-center gap-2"
                  >
                    {isScanning ? "" : <FaMicroscope />}
                    {isScanning ? "Scanning..." : "Initiate Scan"}
                  </button>

                </div>
              </form>

              {/* Validation Message */}
              {message && (
                <p className="mt-3 text-sm text-white">{message}</p>
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

          {/* Right — Upsell panel (replaces the statistics panel for guests) */}
          <div className="w-full lg:w-72">
            <div className="bg-white border rounded-xl p-6">

              <div className="flex items-center gap-2 mb-4">
                <FaShieldHalved className="text-red-600 text-xl" />
                <h2 className="text-sm font-semibold text-gray-700">UNLOCK FULL ACCESS</h2>
              </div>

              <p className="text-sm text-gray-500 mb-5">
                Create a free account to get access to the full PhisSafe experience.
              </p>

              {/* Benefits list */}
              <ul className="text-sm text-gray-700 space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-0.5">✓</span>
                  <span>Full scan history — revisit every URL you've analysed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-0.5">✓</span>
                  <span>Personal threat statistics & phishing score trends.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-0.5">✓</span>
                  <span>Report suspicious URLs to help protect the community.</span>
                </li>
              </ul>

              <button
                onClick={() => router.push("/register")}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-lg mb-3"
              >
                Create Free Account
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full border rounded-lg py-3 text-sm text-gray-500 hover:text-red-600"
              >
                Sign In
              </button>

            </div>

            {/* Guest notice */}
            <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-4 flex items-start gap-3">
              <FaUserSlash className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400">
                You are browsing as a guest. Scans are not saved and history is unavailable.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
