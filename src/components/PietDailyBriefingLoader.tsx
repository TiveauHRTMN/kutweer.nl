import { fetchPietDailyBriefing } from "@/lib/piet-briefing";
import PietDailyBriefing from "@/components/PietDailyBriefing";

export default async function PietDailyBriefingLoader() {
  const data = await fetchPietDailyBriefing().catch(() => null);
  if (!data) return null;
  return <PietDailyBriefing data={data} />;
}
