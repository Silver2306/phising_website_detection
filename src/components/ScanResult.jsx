"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FaArrowLeft, FaFlag, FaPrint, FaTriangleExclamation, FaUserPlus } from "react-icons/fa6";

export default function ScanResult() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const url = searchParams.get("url");
  const prediction = searchParams.get("prediction");
  // guest=true is appended by GuestDashboard when navigating here.
  const isGuest = searchParams.get("guest") === "true";
  const score = "--";
  const indicators = [];
  const isPhishing = prediction === "phishing";

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Top Section */}
        <div className="flex justify-between items-start mb-6">

          <div>

            <p className="text-sm font-semibold text-gray-500">ANALYSIS REPORT</p>

            <h1 className="text-2xl font-bold text-black mt-1 break-all">
              {url || "No URL provided"}
            </h1>

          </div>

          {/* PDF Button */}{/*WILL KEEP ONLY IF NEEDED*/}
          <button disabled className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-500">
            <FaPrint />Export PDF
          </button>

        </div>

        {/* Result Banner */}
        <div className="bg-red-700 text-white rounded-xl p-6 mb-6 flex justify-between items-center">
          <div>

            <div className="flex items-center gap-3">
              <FaTriangleExclamation className="text-2xl" />
              <h2 className="text-xl font-bold">{isPhishing ? "Phishing Website" : "Legitimate Website"}</h2>

            </div>

            {/*FLASK NEEDED FIZZA*/}
            <p className="mt-2">{isPhishing ? "This URL may be harmful. Please exercise caution." : "This URL appears to be safe."}</p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-sm font-semibold">CONFIDENCE SCORE</p>
            <p className="text-4xl font-bold mt-1">{score}</p> {/*SCORE DISPLAY*/}
          </div>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-[1fr_300px] gap-6">

          {/* Threat Indicators */}
          <div className="bg-white border rounded-xl">
            <div className="p-6">
              <h2 className="text-lg font-bold text-black">Extracted Threat Indicators</h2>

            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead className="border-t border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-gray-500">Feature Category</th>

                  <th className="text-left p-4 text-gray-500">Observation</th>

                  <th className="text-left p-4 text-gray-500">Impact</th>
                </tr>
              </thead>
              <tbody>

                {indicators.length === 0 ? (
                  <tr>
                    {/*FLASK NEEDED FIZZA*/}
                    <td colSpan="3" className="p-6 text-center text-gray-500">Threat indicators FLASK NOT CONNECTED</td>
                  </tr>
                ) : (
                  indicators.map((indicator, index) => (

                    <tr key={index} className="border-b">
                      <td className="p-4">{indicator.name}</td>
                      <td className="p-4">{indicator.meaning}</td>
                      <td className="p-4 text-red-600 font-semibold">{indicator.impact}</td>
                    </tr>

                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Right Side INTRIGATE LATER*/}
          <div>
            {/* Actions */}
            <div className="bg-white border rounded-xl p-6 mb-6">
              <h2 className="font-bold text-black mb-4">Required Actions</h2>

              {/* Report */}
              <button onClick={() => router.push(`/report?url=${encodeURIComponent(url)}`)}
                className="w-full border rounded-lg px-4 py-3 flex items-center gap-3 text-gray-500 hover:text-red-600 mb-3">
                <FaFlag />Report this URL
              </button>

              {/* Dashboard / Guest BACK BUTTON — context-aware */}
              <button
                onClick={() => router.push(isGuest ? "/guest" : "/dashboard")}
                className="w-full border rounded-lg px-4 py-3 flex items-center gap-3 text-gray-600 hover:text-red-600">
                <FaArrowLeft />{isGuest ? "Back to Guest Scanner" : "Return to Dashboard"}
              </button>
            </div>

            {/* Metadata BOTTOM RIGHT PART*/}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-black mb-4">Scan Metadata</h2>
              <div className="text-sm">

                <div className="flex justify-between mb-4">
                  <span className="text-gray-500">Prediction:</span>
                  <span className="font-semibold">{prediction}  </span>
                </div>

                {/*WILL BE INTRIGATED LATER*/}
                <div className="flex justify-between mb-4">
                  <span className="text-gray-500">Model Used:</span>
                  <span className="font-semibold">Not connected</span>
                </div>

                {/*WILL BE INTRIGATED LATER*/}
                <div className="flex justify-between">
                  <span className="text-gray-500">Database Check:</span>
                  <span className="font-semibold">Not connected</span>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest upsell banner — only shown when browsing as a guest */}
        {isGuest && (
          <div className="mt-8 bg-white border border-dashed border-red-300 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <FaUserPlus className="text-red-600 text-2xl shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-black">Save this result — create a free account</p>
                <p className="text-sm text-gray-500 mt-1">
                  Guests cannot save scan history. Sign up to track all your scans, view statistics,
                  and report phishing URLs.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => router.push("/register")}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                Create Account
              </button>
              <button
                onClick={() => router.push("/")}
                className="border rounded-lg px-5 py-2.5 text-sm text-gray-500 hover:text-red-600">
                Sign In
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}