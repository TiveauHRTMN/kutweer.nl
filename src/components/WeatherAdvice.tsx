import React from "react";

type WeatherCondition = "rain" | "heat" | "frost" | "default";

interface WeatherAdviceProps {
  temperature: number;
  precipitation: number;
  isFreezing?: boolean;
  locale?: "nl" | "de";
}

export default function WeatherAdvice({
  temperature,
  precipitation,
  isFreezing,
  locale = "nl",
}: WeatherAdviceProps) {
  const affiliateTag = "tiveaubusines-21";
  let condition: WeatherCondition = "default";

  if (isFreezing || temperature < 2) {
    condition = "frost";
  } else if (precipitation > 1) {
    condition = "rain";
  } else if (temperature > 25) {
    condition = "heat";
  }

  if (condition === "default") return null;

  const contentMap = {
    rain: locale === "de"
      ? {
          title: "Vorhersage: Kräftige Schauer. Bleib unterwegs trocken.",
          buttonText: "Die besten Regenschirme ansehen",
          url: `https://www.amazon.de/s?k=regenregenschirm&tag=${affiliateTag}`,
          icon: "☂️",
          color: "bg-blue-50 border-blue-200 text-blue-800",
        }
      : {
          title: "Verwachting: Flinke buien. Blijf droog onderweg.",
          buttonText: "Bekijk de best geteste stormparaplu's",
          url: `https://www.amazon.nl/s?k=stormparaplu&tag=${affiliateTag}`,
          icon: "☂️",
          color: "bg-blue-50 border-blue-200 text-blue-800",
        },
    heat: locale === "de"
      ? {
          title: "Richtig warm! Perfekt für Grillen oder Abkühlung.",
          buttonText: "Ventilatoren & Airco ansehen",
          url: `https://www.amazon.de/s?k=ventilator+klimaanlage&tag=${affiliateTag}`,
          icon: "☀️",
          color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        }
      : {
          title: "Zomers warm! Ideaal BBQ weer of tijd voor verkoeling.",
          buttonText: "Houd het huis koel: Ventilatoren & Airco's",
          url: `https://www.amazon.nl/s?k=ventilator+airco&tag=${affiliateTag}`,
          icon: "☀️",
          color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        },
    frost: locale === "de"
      ? {
          title: "Achtung: Frost möglich. Mach dich vor der Fahrt bereit.",
          buttonText: "Eiskratzer ansehen",
          url: `https://www.amazon.de/s?k=eiskratzer+scheibenenteiser&tag=${affiliateTag}`,
          icon: "❄️",
          color: "bg-indigo-50 border-indigo-200 text-indigo-800",
        }
      : {
          title: "Let op: Kans op vorst. Zorg dat je klaar bent voor vertrek.",
          buttonText: "Ruitontdooier & IJskrabbers",
          url: `https://www.amazon.nl/s?k=ijskrabber+ruitontdooier&tag=${affiliateTag}`,
          icon: "❄️",
          color: "bg-indigo-50 border-indigo-200 text-indigo-800",
        },
  };

  const advice = contentMap[condition];

  return (
    <div className={`mt-6 p-4 rounded-xl border-2 ${advice.color} shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{advice.icon}</span>
        <div>
          <h3 className="font-semibold text-lg m-0">
            {locale === "de" ? "WEERZONE Empfehlung" : "Weerzone Advies"}
          </h3>
          <p className="opacity-90 text-sm mt-1">{advice.title}</p>
        </div>
      </div>
      <a
        href={advice.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-center w-full md:w-auto"
      >
        {advice.buttonText}
      </a>
    </div>
  );
}
