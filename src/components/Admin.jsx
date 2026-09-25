"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "../lib/supabase/client";

import {
  FaArrowLeft,
  FaCheck,
  FaRightFromBracket,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";

export default function Admin({ user, reports }) {
  const router = useRouter();

  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  const pendingReports = reports.filter(
    (report) =>
      !report.status ||
      report.status === "pending"
  );

  const reviewedReports = reports.filter(
    (report) =>
      report.status === "verified" ||
      report.status === "rejected" ||
      report.status === "inconclusive"
  );

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  async function updateReportStatus(reportId, status) {
  setUpdatingId(reportId);
  setMessage("");

  try {
    const response = await fetch(
      `/api/admin/reports/${reportId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setMessage(
        result.error || "Could not update the report."
      );
      return;
    }

    setMessage(`Report marked as ${status}.`);

    router.refresh();
  } catch (error) {
    console.error("Report update error:", error);

    setMessage("Could not update the report.");
  } finally {
    setUpdatingId(null);
  }
}

  const adminName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ADMIN HEADER */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaShieldHalved className="text-red-600 text-xl" />

            <div>
              <h1 className="text-lg font-bold">
                Admin Operations Console
              </h1>

              <p className="text-xs text-gray-400">
                PhisSafe Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {adminName}
              </p>

              <p className="text-xs text-gray-400">
                Admin Access Level
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            >
              <FaRightFromBracket />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* BACK TO DASHBOARD */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 text-2xl font-bold"
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">
            ADMINISTRATION
          </p>

          <h2 className="text-2xl font-bold text-black mt-1">
            Report Review Dashboard
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Review community-submitted suspicious URLs and assign a final review status.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-500">
              PENDING REVIEWS
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {pendingReports.length}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-500">
              REVIEWED REPORTS
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {reviewedReports.length}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-500">
              TOTAL REPORTS
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {reports.length}
            </p>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="bg-white border rounded-lg px-4 py-3 mb-6 text-sm text-gray-600">
            {message}
          </div>
        )}

        {/* PENDING REPORTS */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-black mb-4">
            Reports Requiring Review
          </h3>

          <div className="bg-white border rounded-xl overflow-hidden">
            {pendingReports.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-black">
                  No pending reports
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  New community reports will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Reported URL
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Category
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Context
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Submitted
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Admin Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pendingReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm font-medium text-black break-all">
                          {report.url}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {report.category || "--"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 max-w-xs">
                        {report.context || "--"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {report.submitted_at
                          ? new Date(
                              report.submitted_at
                            ).toLocaleString()
                          : "--"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            disabled={
                              updatingId === report.id
                            }
                            onClick={() =>
                              updateReportStatus(
                                report.id,
                                "verified"
                              )
                            }
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                          >
                            <FaCheck />
                            Verify
                          </button>

                          <button
                            disabled={
                              updatingId === report.id
                            }
                            onClick={() =>
                              updateReportStatus(
                                report.id,
                                "rejected"
                              )
                            }
                            className="border px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-red-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            <FaXmark />
                            Reject
                          </button>

                          <button
                            disabled={
                              updatingId === report.id
                            }
                            onClick={() =>
                              updateReportStatus(
                                report.id,
                                "inconclusive"
                              )
                            }
                            className="border px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-black disabled:opacity-50"
                          >
                            Inconclusive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* REVIEWED REPORTS */}
        <section>
          <h3 className="text-lg font-bold text-black mb-4">
            Reviewed Reports
          </h3>

          <div className="bg-white border rounded-xl overflow-hidden">
            {reviewedReports.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-black">
                  No reviewed reports
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Completed reviews will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      URL
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Category
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Reviewed At
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reviewedReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-black break-all">
                        {report.url}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {report.category || "--"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            report.status === "verified"
                              ? "text-red-600 font-semibold"
                              : "text-gray-600 font-semibold"
                          }
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {report.reviewed_at
                          ? new Date(
                              report.reviewed_at
                            ).toLocaleString()
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}