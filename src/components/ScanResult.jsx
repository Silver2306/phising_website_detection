"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaFlag,
  FaTriangleExclamation,
  FaCircleCheck,
  FaUserPlus,
  FaGlobe,
} from "react-icons/fa6";
import { LiaFishSolid } from "react-icons/lia";

export default function ScanResult({
  url,
  prediction,
  domainInfo,
  features,
  score = "--",
  modelVersion,
  scannedAt,
  databaseCheck,
  isGuest = false,
}) {
  const router = useRouter();

  const isPhishing =
    prediction?.toLowerCase() === "phishing";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href={isGuest ? "/guest" : "/dashboard"} className="flex items-center gap-2 cursor-pointer">
            <LiaFishSolid className="text-red-600 text-3xl" />
            <span className="font-semibold text-black text-xl tracking-tight">PhisSafe</span>
          </Link>

          {/* Navigation CTA */}
          {isGuest ? (
            <Link
              href="/guest"
              className="border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:border-red-600 transition bg-white"
            >
              <FaArrowLeft />
              Back to Scanner
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:border-red-600 transition bg-white"
            >
              <FaArrowLeft />
              Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Top Title Section */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">ANALYSIS REPORT</p>
          <h1 className="text-2xl font-bold text-black mt-1 break-all">
            {url || "No URL provided"}
          </h1>
        </div>

        {/* Dynamic Result Banner */}
        <div
          className={`${isPhishing ? "bg-red-700" : "bg-emerald-600"
            } text-white rounded-xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm`}
        >
          <div>
            <div className="flex items-center gap-3">
              {isPhishing ? (
                <FaTriangleExclamation className="text-3xl" />
              ) : (
                <FaCircleCheck className="text-3xl" />
              )}
              <h2 className="text-2xl font-bold">
                {isPhishing ? "Phishing Website" : "Legitimate Website"}
              </h2>
            </div>

            <p className="mt-2 text-sm sm:text-base opacity-95">
              {isPhishing
                ? "This URL appears to be suspicious and may be harmful. Please exercise caution."
                : "This URL appears to be safe based on evaluated threat indicators."}
            </p>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
              CONFIDENCE SCORE
            </p>
            <p className="text-4xl font-bold mt-1">
              {score !== "--" && score !== null && score !== undefined
                ? typeof score === "number"
                  ? score <= 1
                    ? `${(score * 100).toFixed(1)}%`
                    : `${score}%`
                  : String(score).includes("%")
                    ? score
                    : `${score}%`
                : "--"}
            </p>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Left Column: ML Extracted Threat Indicators Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  Extracted Threat Indicators
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  13 machine learning features extracted directly from webpage & URL analysis
                </p>
              </div>
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full shrink-0">
                ML Features
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b text-xs uppercase text-gray-500 font-semibold">
                  <tr>
                    <th className="text-left p-4">Feature Name</th>
                    <th className="text-left p-4">Extracted Value</th>
                    <th className="text-left p-4">Feature Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!features || Object.keys(features).length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-gray-500">
                        Scan feature information unavailable
                      </td>
                    </tr>
                  ) : (
                    [
                      {
                        key: "domain_length",
                        label: "Domain Length",
                        category: "Lexical Structure",
                        impact: "Character length of the website domain",
                      },
                      {
                        key: "url_entropy",
                        label: "URL Entropy",
                        category: "Lexical Structure",
                        impact: "Calculated character randomness (entropy) score",
                        format: (v) => typeof v === "number" ? v.toFixed(4) : v,
                      },
                      {
                        key: "count_www",
                        label: "WWW Subdomain Count",
                        category: "Lexical Structure",
                        impact: "Occurrences of 'www' in tokenized URL",
                      },
                      {
                        key: "average_length_of_words",
                        label: "Average Word Length",
                        category: "Lexical Structure",
                        impact: "Average character length of tokenized URL words",
                        format: (v) => typeof v === "number" ? v.toFixed(2) : v,
                      },
                      {
                        key: "url_length",
                        label: "URL Length",
                        category: "Lexical Structure",
                        impact: "Total character length of target URL",
                      },
                      {
                        key: "no_of_slashes_inpath",
                        label: "Path Slashes Count",
                        category: "Lexical Structure",
                        impact: "Number of forward slashes in URL path",
                      },
                      {
                        key: "hostname_digit_ratio",
                        label: "Hostname Digit Ratio",
                        category: "Lexical Structure",
                        impact: "Ratio of numeric digits within the hostname",
                        format: (v) => typeof v === "number" ? v.toFixed(4) : v,
                      },
                      {
                        key: "no_of_internal_links",
                        label: "Internal Links Count",
                        category: "HTML Content",
                        impact: "Count of internal hyperlinks extracted from HTML",
                      },
                      {
                        key: "presence_of_free_hosting",
                        label: "Free Hosting Service",
                        category: "Domain Infrastructure",
                        impact: "Flag for known free hosting provider domains",
                        format: (v) => (v === 1 ? "1 (Free Host)" : v === 0 ? "0 (Standard Host)" : String(v)),
                      },
                      {
                        key: "no_of_Images",
                        label: "Images Count",
                        category: "HTML Content",
                        impact: "Number of <img> tags found in page HTML",
                      },
                      {
                        key: "title_mismatch_with_domain",
                        label: "Title Domain Mismatch",
                        category: "HTML Content",
                        impact: "Flag for mismatch between HTML title and domain",
                        format: (v) => (v === 1 ? "1 (Mismatch)" : v === 0 ? "0 (Match)" : String(v)),
                      },
                      {
                        key: "is_copyright_mismatch",
                        label: "Copyright Mismatch",
                        category: "HTML Content",
                        impact: "Flag for copyright notice mismatch",
                        format: (v) => (v === 1 ? "1 (Mismatch)" : v === 0 ? "0 (Match)" : String(v)),
                      },
                      {
                        key: "Script_loaded_from_ext_domain",
                        label: "External Script Loading",
                        category: "HTML Content",
                        impact: "Flag for scripts executing from external domains",
                        format: (v) => (v === 1 ? "1 (External Script)" : v === 0 ? "0 (Internal Only)" : String(v)),
                      },
                    ].map((def) => {
                      const rawValue = features[def.key];
                      const displayVal = rawValue !== undefined && rawValue !== null
                        ? def.format ? def.format(rawValue) : String(rawValue)
                        : "Unavailable";

                      return (
                        <tr key={def.key} className="hover:bg-gray-50/80 transition">
                          <td className="p-4 font-medium text-gray-900">
                            <div>{def.label}</div>
                            <span className="text-[11px] text-gray-400">{def.category}</span>
                          </td>
                          <td className="p-4 font-semibold">
                            <span className="text-gray-900 font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              {displayVal}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{def.impact}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Actions, Metadata & Domain WHOIS Cards */}
          <div className="space-y-6">

            {/* Actions Card — logged-in users only */}
            {!isGuest && (
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-black mb-4 text-base">Required Actions</h2>

                <button
                  onClick={() => router.push(`/report?url=${encodeURIComponent(url)}`)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:border-red-600 transition bg-white shadow-sm"
                >
                  <FaFlag className="text-red-600" />
                  Report this URL
                </button>
              </div>
            )}

            {/* Scan Metadata Card — logged-in users only */}
            {!isGuest && (
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-black mb-4 text-base">Scan Metadata</h2>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 text-xs font-medium uppercase">Prediction</span>
                    <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${isPhishing ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {prediction}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 text-xs font-medium uppercase">Model Used</span>
                    <span className="font-semibold text-xs text-gray-800">{modelVersion || "CompPhish RF v1.0"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium uppercase">Database Check</span>
                    {((databaseCheck || domainInfo?.database_check || "").includes("Blacklisted")) ? (
                      <span className="font-semibold text-xs text-red-600 flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        <FaTriangleExclamation className="text-red-600 text-xs" />
                        {databaseCheck || domainInfo?.database_check}
                      </span>
                    ) : (
                      <span className="font-semibold text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {databaseCheck || domainInfo?.database_check || "Not Found in DB"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Domain WHOIS / RDAP Registration Metadata Card */}
            {isGuest ? (
              <div className="bg-white border rounded-xl p-5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaGlobe className="text-gray-400 text-base" />
                  <h2 className="font-bold text-black text-sm">Domain WHOIS Data</h2>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  RDAP domain registry details are available for registered users.
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Create an account to unlock →
                </button>
              </div>
            ) : (
              domainInfo && (
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-blue-600" />
                      <h2 className="font-bold text-black text-base">Domain WHOIS Data</h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      RDAP
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-50 border rounded-lg p-3">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase">Domain Age</p>
                      <p className="text-base font-bold text-black mt-0.5">
                        {domainInfo.domain_age_days !== null && domainInfo.domain_age_days !== undefined
                          ? `${domainInfo.domain_age_days} days`
                          : "Unavailable"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{domainInfo.domain_age_message || "Age from RDAP registry"}</p>
                    </div>

                    <div className="bg-slate-50 border rounded-lg p-3">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase">Registration Date</p>
                      <p className="text-sm font-bold text-black mt-0.5">
                        {domainInfo.creation_date
                          ? new Date(domainInfo.creation_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                          : "Unavailable"}
                      </p>
                    </div>

                    <div className="bg-slate-50 border rounded-lg p-3">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase">Expiration Date</p>
                      <p className="text-sm font-bold text-black mt-0.5">
                        {domainInfo.expiration_date
                          ? new Date(domainInfo.expiration_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                          : "Unavailable"}
                      </p>
                    </div>

                    <div className="bg-slate-50 border rounded-lg p-3">
                      <p className="text-[11px] text-gray-500 font-semibold uppercase">Registrar Authority</p>
                      <p className="text-sm font-bold text-black mt-0.5 truncate" title={domainInfo.registrar || "Unavailable"}>
                        {domainInfo.registrar || "Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              )
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
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
              >
                Create Account
              </button>
              <button
                onClick={() => router.push("/")}
                className="border rounded-lg px-5 py-2.5 text-sm text-gray-500 hover:text-red-600 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}