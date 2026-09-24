"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {FaArrowLeft,FaFlag} from "react-icons/fa6";
import { createClient } from "../lib/supabase/client";

export default function ReportURL({ url, user }) {

  const router = useRouter();

  {/* FORM DATA */}
  const [reportUrl, setReportUrl] = useState(url);
  const [category, setCategory] = useState(
    "Known Malicious"
  );

  const [context, setContext] = useState("");
  const [message, setMessage] = useState("");

  {/* SUBMIT REPORT */}
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

  const { error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      url: reportUrl.trim(),
      category: category,
      context: context.trim() || null,
    });

  if (error) {
    console.error("Report error:", error);

    setMessage(
      "Something went wrong. Please try again."
    );

    return;
  }

  setMessage(
    "Report submitted successfully. Thank you!"
  );

  // Optional: clear form after success
  setReportUrl("");
  setCategory("");
  setContext("");
}

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-screen-xl mx-auto px-6 py-8">

        {/* TOP SECTION */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500">COMMUNITY REPORT</p>
            <h1 className="text-2xl font-bold text-black mt-1">Report Suspicious URL</h1>
            <p className="text-sm text-gray-500 mt-1">Submit a website for administrator review</p>
          </div>

          {/* BACK BUTTON */}
          <button onClick={() => router.back()}className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-red-600">
            <FaArrowLeft />Back
          </button>
        </div>

        {/* REPORT FORM */}
        <div className="bg-white border rounded-xl p-5 sm:p-8 max-w-3xl">
          <form onSubmit={handleSubmit}>
            {/* URL */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">URL to Report</label>
              <input type="text" value={reportUrl}
                onChange={(e) => {
                  setReportUrl(e.target.value);
                  setMessage("");}}
                placeholder="Enter website URL"
                className="w-full border rounded-lg px-4 h-12 text-black outline-none"/>
            </div>

            {/* REPORT CATEGORY */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">Report Category</label>
              
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setMessage("");
                }}
                className="w-full border rounded-lg px-4 h-12 text-black outline-none bg-white"
              >
                <option value="Known Malicious">Known Malicious</option>
                <option value="False Negative">False Negative (Incorrect Prediction)</option>
              </select>
            </div>

            {/* ADDITIONAL CONTEXT */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                Additional Context
              </label>
              <textarea value={context}
                onChange={(e) =>
                  setContext(e.target.value)
                }
                placeholder="Explain why you are reporting this URL..." rows="5"
                className="w-full border rounded-lg px-4 py-3 text-black outline-none resize-none"/>
              <p className="text-xs text-gray-500 mt-2">Optional</p>
            </div>

            {/* MESSAGE */}
            {message && (
              <p className="text-sm text-gray-500 mb-4">{message}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 h-12 font-semibold flex items-center gap-2">
              <FaFlag />Submit to Review Queue
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}