import GuestDashboard from "../../components/GuestDashboard";

export const metadata = {
  title: "PhisSafe — Guest Mode",
  description: "Scan URLs for phishing threats without creating an account.",
};

export default function GuestPage() {
  // No auth check — this page is intentionally public.
  return <GuestDashboard />;
}
