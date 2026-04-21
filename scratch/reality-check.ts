
import { createSupabaseAdminClient } from './src/lib/supabase/admin';

async function realityCheck() {
  const supabase = createSupabaseAdminClient();
  
  console.log("🚀 WEERZONE REALITY CHECK — LIVE DATABASE STATUS\n");

  // 1. FREE SUBSCRIBERS
  const { count: freeCount, error: freeError } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true });
  
  if (freeError) console.error("❌ Error fetching freeCount:", freeError.message);
  else console.log(`📧 Free Subscribers: ${freeCount}`);

  // 2. PAID SUBSCRIPTIONS
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('tier, status');

  if (subsError) {
    console.error("❌ Error fetching subscriptions:", subsError.message);
  } else {
    const active = subs.filter(s => ['active', 'trialing'].includes(s.status));
    console.log(`💰 Paid Subscriptions (Active/Trial): ${active.length}`);
    
    const byTier = active.reduce((acc, s) => {
      acc[s.tier] = (acc[s.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   - Piet: ${byTier.piet || 0}`);
    console.log(`   - Reed: ${byTier.reed || 0}`);
    console.log(`   - Steve: ${byTier.steve || 0}`);
  }

  // 3. ANALYTICS (CLICKS/IMPRESSIONS)
  const { count: eventCount, error: eventError } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true });

  if (eventError) {
    // Misschien bestaat de tabel nog niet?
    console.log("📊 Analytics Events: Tabel nog niet aangemaakt of leeg.");
  } else {
     console.log(`📈 Total Clicks & Impressions: ${eventCount}`);
  }

  // 4. PLACES
  const { ALL_PLACES } = await import('./src/lib/places-data');
  console.log(`\n🗺️  SEO Coverage: ${ALL_PLACES.length} routes generated.`);
  
  console.log("\n--- EINDE RAPPORT ---");
}

realityCheck();
