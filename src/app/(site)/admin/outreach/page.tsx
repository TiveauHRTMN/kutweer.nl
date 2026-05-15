import { Suspense } from "react";
import OutreachControl from "./OutreachControl";

export const metadata = {
  title: "B2B IGNITE | WeerZone Control",
  robots: "noindex, nofollow"
};
export const dynamic = "force-dynamic";

export default function OutreachPage() {
  return (
    <Suspense fallback={null}>
      <OutreachControl />
    </Suspense>
  );
}
