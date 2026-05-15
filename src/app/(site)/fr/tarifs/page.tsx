import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs | WEERZONE France",
  description: "Découvrez les différents tarifs et formules de WEERZONE pour la France.",
  alternates: { canonical: "https://weerzone.nl/fr/tarifs" },
};

export default function TarifsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-text-primary mb-2">Tarifs</h1>
        <p className="text-text-secondary">Bientôt disponible en France. Gratuit pendant la période de bêta.</p>
      </div>
    </main>
  );
}