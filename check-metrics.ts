
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import * as fs from 'fs';
import * as path from 'path';

async function check() {
    console.log("🔍 Fetching live DB metrics...");
    
    // Lees env uit .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) env[k.trim()] = v.trim();
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { count: free } = await supabase.from('subscribers').select('*', { count: 'exact', head: true });
    const { data: subs } = await supabase.from('subscriptions').select('tier, status');
    
    const active = (subs || []).filter(s => ['active', 'trialing'].includes(s.status));
    const totals = active.reduce((acc, s) => {
        acc[s.tier] = (acc[s.tier] || 0) + 1;
        return acc;
    }, {});

    console.log("\n======================================");
    console.log("   WEERZONE LIVE REALITY CHECK");
    console.log("======================================");
    console.log(`📧 Free Subscribers:   ${free || 0}`);
    console.log(`💰 Paid Active Subs:   ${active.length}`);
    console.log(`   - Piet:  ${totals.piet || 0}`);
    console.log(`   - Reed:  ${totals.reed || 0}`);
    console.log(`   - Steve: ${totals.steve || 0}`);
    console.log("======================================\n");
}

check();
