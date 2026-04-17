export const dynamic = "force-static";

export function GET() {
  return new Response(
    "google.com, pub-6187487207780127, DIRECT, f08c47fec0942fa0\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
