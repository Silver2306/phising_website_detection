"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FaArrowLeft,
  FaFilter,
  FaMagnifyingGlass,
} from "react-icons/fa6";

export default function History({ scans }) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.url.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || scan.prediction === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* TOP SECTION */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Analysis History
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View your previous website scans.
            </p>
          </div>

          {/* BACK TO DASHBOARD */}
          <button
            onClick={() => router.push("/dashboard")}
            className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-red-600"
          >
            <FaArrowLeft />
            Dashboard
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex justify-end gap-3 mb-6">

          {/* SEARCH */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-3 text-gray-500" />

            <input
              type="text"
              placeholder="Search URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg h-10 w-60 pl-10 pr-4 outline-none text-black"
            />
          </div>

          {/* FILTER */}
          <div className="relative flex items-center">
            <FaFilter className="absolute left-3 text-gray-500 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg h-10 pl-9 pr-4 bg-white text-black outline-none font-medium cursor-pointer hover:border-red-500 transition"
            >
              <option value="all">All Predictions</option>
              <option value="phishing">Phishing Only</option>
              <option value="legitimate">Legitimate Only</option>
            </select>
          </div>
        </div>

        {/* HISTORY TABLE */}
        <div className="bg-white border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">

            {/* TABLE HEADER */}
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-gray-500">
                  Target URL
                </th>

                <th className="text-left p-4 text-gray-500">
                  Date & Time
                </th>

                <th className="text-left p-4 text-gray-500">
                  Prediction
                </th>

                <th className="text-left p-4 text-gray-500">
                  Score
                </th>

                <th className="text-left p-4 text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {filteredScans.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center"
                  >
                    <p className="font-semibold text-black">
                      No scan history found
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Your completed URL scans will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b"
                  >

                    {/* URL */}
                    <td className="p-4 font-medium text-black break-all">
                      {scan.url}
                    </td>

                    {/* DATE */}
                    <td className="p-4 text-gray-500">
                      {new Date(scan.scanned_at).toLocaleString("en-US")}
                    </td>

                    {/* PREDICTION */}
                    <td className="p-4">
                      <span
                        className={
                          scan.prediction === "phishing"
                            ? "text-red-600 font-semibold"
                            : "text-black font-semibold"
                        }
                      >
                        {scan.prediction}
                      </span>
                    </td>

                    {/* SCORE */}
                    <td className="p-4 font-semibold text-black">
                      {scan.confidence !== null && scan.confidence !== undefined
                        ? typeof scan.confidence === "number"
                          ? scan.confidence <= 1
                            ? `${(scan.confidence * 100).toFixed(1)}%`
                            : `${scan.confidence}%`
                          : `${scan.confidence}`
                        : "--"}
                    </td>

                    {/* VIEW REPORT */}
                    <td className="p-4">
                      <button
                        onClick={() =>
                        router.push(`/scan/${scan.id}`)}
                        className="text-red-600 font-semibold">
                        View Report
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </main>
    </div>
  );
}