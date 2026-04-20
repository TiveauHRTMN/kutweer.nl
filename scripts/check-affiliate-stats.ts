import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('--- Affiliate Tracking Stats (Internal: analytics_events) ---');
  
  const { count: totalImpressions, error: err1 } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'IMPRESSION');

  const { count: totalClicks, error: err2 } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'CLICK');

  if (err1 || err2) {
    console.error('Error fetching stats:', err1 || err2);
    // Even proberen zonder de eq filter om te zien of tabel bestaat
    const { count: rawCount } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true });
    console.log('Raw count in table:', rawCount);
    return;
  }

  console.log(`Total Impressions on Website: ${totalImpressions}`);
  console.log(`Total Clicks on Website: ${totalClicks}`);

  // Laatste 5 clicks
  const { data: recentClicks } = await supabase
    .from('analytics_events')
    .select('condition_tag, created_at, platform')
    .eq('event_type', 'CLICK')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentClicks?.length) {
    console.log('\n--- Recent 5 Clicks ---');
    recentClicks.forEach(c => {
      console.log(`[${c.created_at}] Tag: ${c.condition_tag} Platform: ${c.platform}`);
    });
  } else {
    console.log('\nNo recent clicks recorded in our database yet.');
  }
}

checkStats();
