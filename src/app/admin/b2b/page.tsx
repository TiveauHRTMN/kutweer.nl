import { getSupabase } from "@/lib/supabase";
import B2BAdminPanel from "@/components/B2BAdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

interface PageProps {
  searchParams: Promise<{ secret?: string }>;
}

export default async function B2BAdminPage({ searchParams }: PageProps) {
  const { secret } = await searchParams;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== cronSecret) {
    return (
      <div style={{ padding: 48, fontFamily: "system-ui", background: "#0f172a", minHeight: "100vh", color: "#fff" }}>
        <h1 style={{ color: "#f59e0b", marginBottom: 8 }}>Toegang geweigerd</h1>
        <p style={{ color: "#94a3b8" }}>
          Voeg <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>?secret=JOUW_CRON_SECRET</code> toe aan de URL.
        </p>
      </div>
    );
  }

  const supabase = getSupabase();

  let leads: Array<{
    id: string;
    business_name: string;
    email: string;
    city: string | null;
    industry: string;
    phone: string | null;
    status: string;
    outreach_count: number;
    source: string;
    created_at: string;
  }> = [];

  if (supabase) {
    const { data } = await supabase
      .from("b2b_leads")
      .select("id, business_name, email, city, industry, phone, status, outreach_count, source, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    leads = data ?? [];
  }

  const stats = {
    total:      leads.length,
    new:        leads.filter((l) => l.status === "new").length,
    emailed:    leads.filter((l) => l.status === "emailed").length,
    subscribed: leads.filter((l) => l.status === "subscribed").length,
  };

  return <B2BAdminPanel stats={stats} leads={leads} secret={secret ?? ""} />;
}
