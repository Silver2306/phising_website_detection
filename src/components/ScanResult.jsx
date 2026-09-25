"use client";

import { useRouter } from "next/navigation";

import { FaArrowLeft, FaFlag, FaPrint, FaTriangleExclamation, FaUserPlus } from "react-icons/fa6";

export default function ScanResult({
  url,
  prediction,
  domainInfo,
  score = "--",
  modelVersion,
  scannedAt,
  isGuest = false,
}) {

  const router = useRouter();

  const isPhishing = prediction === "phishing";

  const indicators = domainInfo
    ? [
      {
        name: "Domain Age",
        meaning: `${domainInfo.domain_age_days} days`,
        impact: domainInfo.domain_age_message,
      },
      {
        name: "Registration Date",
        meaning: domainInfo.creation_date
          ? new Date(domainInfo.creation_date).toLocaleDateString()
          : "Unavailable",
        impact: "Domain creation date",
      },
      {
        name: "Expiration Date",
        meaning: domainInfo.expiration_date
          ? new Date(domainInfo.expiration_date).toLocaleDateString()
          : "Unavailable",
        impact: "Registration expiry",
      },
      {
        name: "Registrar",
        meaning: domainInfo.registrar || "Unavailable",
        impact: "Domain registrar",
      },
    ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Back button — guests only, sits above the report header */}
        {isGuest && (
          <button
            onClick={() => router.push("/guest")}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium mb-6">
            <FaArrowLeft />Back to Scanner
          </button>
        )}

        {/* Top Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">

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
        <div className="bg-red-700 text-white rounded-xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Threat Indicators */}
          <div className="bg-white border rounded-xl overflow-x-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-black">Extracted Threat Indicators</h2>

            </div>

            {/* Table */}
            <table className="w-full min-w-[600px] text-sm">
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
                    <td colSpan="3" className="p-6 text-center text-gray-500">
                      Domain information unavailable
                    </td>
                  </tr>
                ) : (
                  indicators.map((indicator, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4 font-medium">{indicator.name}</td>
                      <td className="p-4">{indicator.meaning}</td>
                      <td className="p-4 font-semibold">{indicator.impact}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Right Side INTRIGATE LATER*/}
          <div>
            {/* Required Actions — logged-in users only */}
            {!isGuest && (
              <div className="bg-white border rounded-xl p-6 mb-6">
                <h2 className="font-bold text-black mb-4">Required Actions</h2>

                <button onClick={() => router.push(`/report?url=${encodeURIComponent(url)}`)}
                  className="w-full border rounded-lg px-4 py-3 flex items-center gap-3 text-gray-500 hover:text-red-600 mb-3">
                  <FaFlag />Report this URL
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full border rounded-lg px-4 py-3 flex items-center gap-3 text-gray-600 hover:text-red-600">
                  <FaArrowLeft />Return to Dashboard
                </button>
              </div>
            )}

            {/* Scan Metadata — logged-in users only */}
            {!isGuest && (
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
            )}
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