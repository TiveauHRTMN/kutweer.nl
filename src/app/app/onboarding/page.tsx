import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export const metadata = {
  title: "Kies je persona",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingClient />
    </Suspense>
  );
}
