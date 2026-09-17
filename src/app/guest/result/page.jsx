import ScanResult from "../../../components/ScanResult";

export const metadata = {
  title: "PhisSafe — Scan Result (Guest)",
  description: "Your phishing scan result.",
};

// No auth check — this route is intentionally public for guest users.
export default async function GuestResultPage({ searchParams }) {

  const params = await searchParams;
  const url = params.url || "";

  return <ScanResult url={url} isGuest={true} />;
}
