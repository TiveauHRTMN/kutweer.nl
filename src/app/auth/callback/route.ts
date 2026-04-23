import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Magic-link / OAuth callback: wisselt `code` om voor een sessie
 * en stuurt door naar `next` (default /app).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    console.log(`[AUTH-CALLBACK] Exchanging code for session...`);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(`[AUTH-CALLBACK] Success! User: ${user?.email}`);
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl.href);
    } else {
      console.error(`[AUTH-CALLBACK] Error exchanging code:`, error.message);
    }
  }

  // Fallback if no code or error
  return NextResponse.redirect(`${origin}/app/signup?error=auth`);
}
